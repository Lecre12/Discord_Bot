import { resolveSpeechWithGoogleSpeechV2 } from 'discord-speech-recognition';
import { debugWarn } from './debug-log';

type GoogleSpeechOptions = Parameters<typeof resolveSpeechWithGoogleSpeechV2>[1];

export async function resolveSpanishSpeech(audioBuffer: Buffer, options?: GoogleSpeechOptions): Promise<string> {
  try {
    return await resolveSpeechWithGoogleSpeechV2(audioBuffer, options);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    debugWarn(`[Speech][Recognized] Google STT no devolvio texto valido: ${message}`);
    return '';
  }
}
