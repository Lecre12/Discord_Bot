import { AudioPlayerStatus, createAudioPlayer, createAudioResource, VoiceConnection } from '@discordjs/voice';
import * as googleTTS from 'google-tts-api';
import { Readable } from 'stream';
import axios from 'axios';
import { spawn } from 'child_process';
import { getBuildedAudioPlayer, removeAudioPlayer, serverData } from '..';

/**
 * Reproduce texto como audio en un canal de voz.
 * @param text El texto a leer.
 * @param voiceChannel El canal de voz donde reproducir el audio.
 */
const serverCanContinue = new Map<string, {canContinue: boolean}>();
export async function speakText(text: string, connection: VoiceConnection, guildId: string ) {

  if(!serverCanContinue.get(guildId)){
    serverCanContinue.set(guildId, {
      canContinue: true
    })
  }else{
    serverCanContinue.get(guildId)!.canContinue = true;
  }
  try {
    const maxLength = 200; // Máxima longitud permitida
    const textParts = splitText(text, maxLength); // Dividir el texto en partes

    for (const part of textParts) {
      if(serverCanContinue.get(guildId)?.canContinue){
        // Generar URL de audio TTS para cada parte
        const url = googleTTS.getAudioUrl(part, {
          lang: serverData.get(guildId)!.lang.substring(0, 2),
          slow: false,
        });

        // Descargar el audio como stream
        const response = await axios.get(url, { responseType: 'stream' });
        const audioStream = response.data as Readable;

        // Procesar audio con FFmpeg para cambiar la velocidad (opcional)
        const ffmpeg = spawn('ffmpeg', [
          '-i', 'pipe:0',
          '-filter:a', 'atempo=1.8',
          '-f', 'mp3',
          'pipe:1',
        ]);

        audioStream.pipe(ffmpeg.stdin);
        const processedStream = ffmpeg.stdout;

        // Crear recurso de audio para Discord
        const resource = createAudioResource(processedStream);
        const audioPlayer = getBuildedAudioPlayer(guildId);
        if(!audioPlayer) return;

        // Crear y reproducir audio
        const audioPlayerSubscribe = connection.subscribe(audioPlayer);
        audioPlayer.play(resource);

        // Esperar a que se reproduzca el fragmento antes de continuar con el siguiente
        await new Promise<void>((resolve) =>
          audioPlayer?.on('stateChange', (_, newState) => {
            if (newState.status === 'idle') resolve();
          })
        );
      }else{
        serverCanContinue.get(guildId)!.canContinue = true;
        break;
      }
    }
    removeAudioPlayer(guildId);
    console.log(`Reproduciendo TTS dividido en partes.`);
  } catch (error) {
    console.error('Error reproduciendo TTS:', error);
  }
}

/**
 * @deprecated Use speakText instead.
 */
export async function playAudioFile(filePath: string, connection: VoiceConnection) {
    const player = createAudioPlayer();
    const resource = createAudioResource(filePath);

    connection.subscribe(player);
    player.play(resource);

    player.on(AudioPlayerStatus.Idle, () => {
        console.log("Reproducción terminada.");
        player.stop();
    });

    player.on("error", (error) => {
        console.error("Error al reproducir el archivo:", error);
    });
}
function splitText(text: string, maxLength: number): string[] {
  const parts: string[] = [];
  while (text.length > maxLength) {
    let splitIndex = text.lastIndexOf(' ', maxLength);
    if (splitIndex === -1) splitIndex = maxLength; // Cortar directamente si no hay espacios
    parts.push(text.slice(0, splitIndex));
    text = text.slice(splitIndex).trim();
  }
  if (text.length > 0) parts.push(text);
  return parts;
}
export function setCanContinue(bool: boolean, guildId: string){
  if(!serverCanContinue.get(guildId)){
    serverCanContinue.set(guildId, {
      canContinue: true
    })
  }
  if(!serverCanContinue.get(guildId)?.canContinue){
    return;
  }
    serverCanContinue.get(guildId)!.canContinue = bool;
  
}