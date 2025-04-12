import { AudioPlayerStatus, createAudioPlayer, createAudioResource, VoiceConnection } from '@discordjs/voice';
import * as googleTTS from 'google-tts-api';
import { Readable } from 'stream';
import axios from 'axios';
import { spawn } from 'child_process';
import { getServerData, setAudioPlayer } from './server-data';
import { serverCanContinue } from './audio-continue';

export async function speakText(text: string, guildId: string ) {
    try {
        serverCanContinue.set(guildId, { canContinue: true });
        const maxLength = 200;
        const textParts = splitText(text, maxLength);

        const connection = getServerData(guildId)?.connection;
        if (!connection) return;

        for (const part of textParts) {
            if(!serverCanContinue.get(guildId)?.canContinue) continue;
            const url = googleTTS.getAudioUrl(part, {
            lang: getServerData(guildId)?.lang.substring(0, 2) || 'es',
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
            let audioPlayer = getServerData(guildId)?.audioPlayer;
            if(!audioPlayer) {
                audioPlayer = createAudioPlayer();
                setAudioPlayer(audioPlayer, guildId);
            };

            const audioPlayerSubscribe = connection.subscribe(audioPlayer);
            audioPlayer.play(resource);

            // Esperar a que se reproduzca el fragmento antes de continuar con el siguiente
            await new Promise<void>((resolve) =>
            audioPlayer?.on('stateChange', (_, newState) => {
                if (newState.status === 'idle') resolve();
            })
            );
        }
        console.log(`Reproduciendo TTS dividido en partes.`);
    } catch (error) {
        console.error('Error reproduciendo TTS:', error);
    }
    serverCanContinue.set(guildId, { canContinue: true });
}

function splitText(text: string, maxLength: number): string[] {
const parts: string[] = [];
while (text.length > maxLength) {
    let splitIndex = text.lastIndexOf(' ', maxLength);
    if (splitIndex === -1) splitIndex = maxLength;
    parts.push(text.slice(0, splitIndex));
    text = text.slice(splitIndex).trim();
}
if (text.length > 0) parts.push(text);
return parts;
}