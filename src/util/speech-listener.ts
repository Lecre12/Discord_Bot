import { OpusEncoder } from '@discordjs/opus';
import { EndBehaviorType, VoiceConnection, VoiceConnectionStatus } from '@discordjs/voice';
import { Client } from 'discord.js';
import { Transform } from 'stream';
import { SpeechEvents, SpeechOptions } from 'discord-speech-recognition';
import createVoiceMessage from 'discord-speech-recognition/dist/bot/voiceMessage/createVoiceMessage';
import { debugLog } from './debug-log';

const SPEECH_LISTENER_NAME = 'marronSpeechListener';
const networkingWorkaroundConnections = new WeakSet<VoiceConnection>();

class OpusDecodingStream extends Transform {
  private readonly encoder = new OpusEncoder(48000, 2);

  _transform(data: Buffer, _encoding: BufferEncoding, callback: () => void): void {
    this.push(this.encoder.decode(data));
    callback();
  }
}

export function hasSpeechListener(connection: VoiceConnection): boolean {
  return connection.receiver.speaking
    .listeners('start')
    .some((listener) => listener.name === SPEECH_LISTENER_NAME);
}

export function removeSpeechListener(connection: VoiceConnection): void {
  connection.receiver.speaking
    .listeners('start')
    .filter((listener) => listener.name === SPEECH_LISTENER_NAME)
    .forEach((listener) => connection.receiver.speaking.off('start', listener as (...args: any[]) => void));
}

function applyVoiceNetworkingWorkaround(connection: VoiceConnection): void {
  if (networkingWorkaroundConnections.has(connection)) return;
  networkingWorkaroundConnections.add(connection);

  const networkStateChangeHandler = (_oldNetworkState: unknown, newNetworkState: unknown) => {
    const newUdp = Reflect.get(newNetworkState as object, 'udp');
    clearInterval(newUdp?.keepAliveInterval);
  };

  connection.on('stateChange', (oldState, newState) => {
    Reflect.get(oldState, 'networking')?.off('stateChange', networkStateChangeHandler);
    Reflect.get(newState, 'networking')?.on('stateChange', networkStateChangeHandler);
  });
}

export function attachSpeechListener(client: Client, connection: VoiceConnection, speechOptions: SpeechOptions, force = false): void {
  if (connection.state.status === VoiceConnectionStatus.Destroyed) return;
  if (force) {
    removeSpeechListener(connection);
  } else if (hasSpeechListener(connection)) {
    return;
  }

  applyVoiceNetworkingWorkaround(connection);

  connection.receiver.speaking.on('start', async function marronSpeechListener(userId: string) {
    debugLog(`[Speech][Debug] speaking:start userId=${userId} guild=${connection.joinConfig.guildId}`);

    const user = client.users.cache.get(userId) ?? await client.users.fetch(userId).catch(() => null);
    if (!user) {
      debugLog(`[Speech][Debug] speaking:start sin usuario cache/fetch userId=${userId} guild=${connection.joinConfig.guildId}`);
      return;
    }
    if (speechOptions.shouldProcessSpeech && !speechOptions.shouldProcessSpeech(user)) return;
    if (speechOptions.ignoreBots && user.bot) return;

    debugLog(`[Speech][Debug] speaking:user user=${user.tag} guild=${connection.joinConfig.guildId}`);

    const opusStream = connection.receiver.subscribe(userId, {
      end: {
        behavior: EndBehaviorType.AfterSilence,
        duration: 300,
      },
    });
    const bufferData: Uint8Array[] = [];

    opusStream
      .pipe(new OpusDecodingStream())
      .on('data', (data) => {
        bufferData.push(data);
      })
      .on('error', (error) => {
        client.emit(SpeechEvents.audioStreamError, error);
      });

    opusStream.on('end', async () => {
      debugLog(`[Speech][Debug] speaking:end user=${user.tag} guild=${connection.joinConfig.guildId} chunks=${bufferData.length}`);
      const voiceMessage = await createVoiceMessage({
        client,
        bufferData,
        user,
        connection,
        speechOptions,
      });

      if (voiceMessage) {
        client.emit(SpeechEvents.speech, voiceMessage);
      }
    });
  });

  debugLog(`[Speech][Listener] Instalado guild=${connection.joinConfig.guildId} channel=${connection.joinConfig.channelId} listeners=${connection.receiver.speaking.listenerCount('start')}`);
}
