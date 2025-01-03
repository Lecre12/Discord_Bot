import { createAudioPlayer, createAudioResource, VoiceConnection } from '@discordjs/voice';
import * as googleTTS from 'google-tts-api';
import { Readable } from 'stream';
import axios from 'axios';

/**
 * Reproduce texto como audio en un canal de voz.
 * @param text El texto a leer.
 * @param voiceChannel El canal de voz donde reproducir el audio.
 */
export async function speakText(text: string, connection: VoiceConnection) {
  try {
    // Generar URL de audio TTS
    const url = googleTTS.getAudioUrl(text, {
      lang: 'es', // Cambia el idioma según sea necesario
      slow: false,
    });

    // Descargar el audio como stream
    const response = await axios.get(url, { responseType: 'stream' });
    const audioStream = response.data as Readable;

    // Crear recurso de audio para Discord
    const resource = createAudioResource(audioStream);
    resource.volume?.setVolume(0.7);

    // Crear y reproducir audio
    const player = createAudioPlayer();
    connection.subscribe(player);
    player.play(resource);

    //console.log(`Reproduciendo TTS: "${text}" en ${voiceChannel.name}`);
  } catch (error) {
    console.error('Error reproduciendo TTS:', error);
  }
}
