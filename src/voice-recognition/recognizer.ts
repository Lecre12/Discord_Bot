import { EventEmitter } from "events";
import { VoiceConnection, EndBehaviorType } from "@discordjs/voice";
import { Worker } from "worker_threads";
import path from "path";
import { Client, Guild, User } from "discord.js";
import { speechQueue } from "./speech-queue";
import { VoiceMessage } from "../type/voice-message";

export class SpeechManager extends EventEmitter {
  private connection: VoiceConnection;
  private modelPath: string;
  private client: Client;
  private activeWorkers: Map<string, Worker> = new Map();
  private activeStreams: Map<string, boolean> = new Map(); // Control de streams activos

  constructor(connection: VoiceConnection, modelPath: string, client: Client) {
    super();
    this.connection = connection;
    this.modelPath = modelPath;
    this.client = client;
  }

  listenUser(userId: string) {
    // Verificar si ya hay un stream activo procesando para este usuario
    if (this.activeStreams.get(userId)) {
      console.log(`[SpeechManager] Usuario ${userId} ya está siendo procesado, ignorando nueva suscripción`);
      return;
    }

    // Marcar stream como activo
    this.activeStreams.set(userId, true);

    // Verificar si ya existe un worker activo para este usuario
    let worker = this.activeWorkers.get(userId);
    
    if (!worker) {
      console.log(`[SpeechManager] Creando worker para usuario ${userId}`);

      // Crear un nuevo worker thread para este usuario
      worker = new Worker(path.join(__dirname, "speech-worker.js"), {
        workerData: {
          userId,
          modelPath: this.modelPath,
        },
      });

      this.activeWorkers.set(userId, worker);

      // Escuchar mensajes del worker (solo configurar una vez)
      worker.on("message", (message) => {
        if (message.type === "speech") {
          const { text } = message.data;
          const user: User | undefined = this.client.users.cache.get(userId);
          const guild: Guild | undefined = this.client.guilds.cache.get(
            this.connection.joinConfig.guildId
          );
          let member = null;
          if (user) {
            member = guild?.members.cache.get(user.id);
          }

          if(!text || !user || !guild || !member){
            console.error(`[SpeechManager] Datos incompletos para crear VoiceMessage de ${userId}`);
            return;
          }
          const voiceMessage: VoiceMessage = {
            content: text,
            author: user,
            guild: guild,
            member: member ?? undefined,
          };

          // Añadir a la cola para procesamiento secuencial
          speechQueue.enqueue(voiceMessage);
        } else if (message.type === "finished") {
          console.log(`[SpeechManager] Worker de ${userId} finalizó el procesamiento, listo para el siguiente audio`);
          // Liberar el stream para permitir nuevas suscripciones
          this.activeStreams.set(userId, false);
        } else if (message.type === "error") {
          console.error(`[SpeechManager] Error en worker de ${userId}:`, message.data.error);
          // Liberar el stream en caso de error
          this.activeStreams.set(userId, false);
        }
      });

      worker.on("error", (error) => {
        console.error(`[SpeechManager] Error crítico en worker de ${userId}:`, error);
        worker!.terminate();
        this.activeWorkers.delete(userId);
        this.activeStreams.delete(userId);
      });

      worker.on("exit", (code) => {
        console.log(`[SpeechManager] Worker de ${userId} terminó con código ${code}`);
        this.activeWorkers.delete(userId);
        this.activeStreams.delete(userId);
      });
    } else {
      console.log(`[SpeechManager] Reutilizando worker existente para usuario ${userId}`);
    }

    // Crear nueva suscripción al audio
    const receiver = this.connection.receiver;
    const opusStream = receiver.subscribe(userId, {
      end: {
        behavior: EndBehaviorType.AfterSilence,
        duration: 1000,
      },
    });

    // Enviar datos de audio al worker
    opusStream.on("data", (chunk: Buffer) => {
      worker!.postMessage({
        type: "audioData",
        data: chunk,
      });
    });

    opusStream.on("end", () => {
      console.log(`[SpeechManager] Fin de audio de usuario ${userId}`);
      worker!.postMessage({
        type: "audioEnd",
      });
    });

    opusStream.on("error", (error) => {
      console.error(`[SpeechManager] Error en stream de audio de ${userId}:`, error);
      // Liberar el stream en caso de error
      this.activeStreams.set(userId, false);
    });
  }

  listenAllUsers() {
    this.connection.receiver.speaking.on("start", (userId) => {
      this.listenUser(userId);
    });
  }
}
