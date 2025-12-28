import { parentPort, workerData } from "worker_threads";
import { Model, Recognizer } from "vosk";
import prism from "prism-media";

/**
 * Worker Thread para reconocimiento de voz de un usuario específico
 * Este worker procesa el audio de forma independiente y envía los resultados al hilo principal
 */

interface WorkerData {
  userId: string;
  modelPath: string;
}

interface SpeechResult {
  userId: string;
  text: string;
  timestamp: number;
}

const { userId, modelPath } = workerData as WorkerData;

console.log(`[Worker-${userId}] Iniciando worker para usuario ${userId}`);

// Cargar el modelo de Vosk UNA VEZ
const model = new Model(modelPath);

// Variables para el reconocedor actual
let recognizer: Recognizer<any> | null = null;
let pcmStream: prism.opus.Decoder | null = null;

// Función para crear un nuevo reconocedor
function createNewRecognizer() {
  if (recognizer) {
    try {
      recognizer.free();
    } catch (e) {
      console.error(`[Worker-${userId}] Error liberando recognizer anterior:`, e);
    }
  }
  
  recognizer = new Recognizer({
    model: model,
    sampleRate: 16000,
  });
  
  // Crear nuevo decodificador PCM
  pcmStream = new prism.opus.Decoder({
    frameSize: 160,
    channels: 1,
    rate: 16000,
  });

  pcmStream.on("data", (chunk: Buffer) => {
    try {
      recognizer!.acceptWaveform(chunk);
    } catch (error) {
      console.error(`[Worker-${userId}] Error al procesar audio:`, error);
    }
  });

  pcmStream.on("end", () => {
    try {
      const result = recognizer!.finalResult();
      const text = result.text.trim();

      if (text.length > 0) {
        const speechResult: SpeechResult = {
          userId,
          text,
          timestamp: Date.now(),
        };

        // Enviar resultado al hilo principal
        parentPort?.postMessage({
          type: "speech",
          data: speechResult,
        });

        console.log(`[Worker-${userId}] Reconocido: "${text}"`);
      } else {
        console.log(`[Worker-${userId}] Sin texto reconocido`);
      }
    } catch (error) {
      console.error(`[Worker-${userId}] Error al finalizar reconocimiento:`, error);
    }

    // Notificar que el worker ha terminado de procesar este audio
    parentPort?.postMessage({
      type: "finished",
      data: { userId },
    });
    
    // Preparar para el siguiente audio
    createNewRecognizer();
  });

  pcmStream.on("error", (error) => {
    console.error(`[Worker-${userId}] Error en PCM stream:`, error);
    parentPort?.postMessage({
      type: "error",
      data: { userId, error: error.message },
    });
    // Reintentar con un nuevo recognizer
    createNewRecognizer();
  });
}

// Inicializar el primer recognizer
createNewRecognizer();

// Recibir datos de audio desde el hilo principal
parentPort?.on("message", (message) => {
  if (message.type === "audioData") {
    // Escribir los datos de audio al stream PCM actual
    if (pcmStream) {
      pcmStream.write(message.data);
    }
  } else if (message.type === "audioEnd") {
    // Finalizar el stream actual
    if (pcmStream) {
      pcmStream.end();
    }
  }
});

console.log(`[Worker-${userId}] Worker listo para procesar audio`);
