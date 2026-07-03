import { getVoiceConnection, VoiceConnectionStatus } from '@discordjs/voice';
import { Guild } from 'discord.js';
import { hasSpeechListener } from './speech-listener';
import { getServerData } from './server-data';
import { isDebugLogsEnabled } from './debug-log';

export function getVoiceStatusLines(guild: Guild): string[] {
  const serverData = getServerData(guild.id);
  const connection = serverData?.connection ?? getVoiceConnection(guild.id);
  const channelId = connection?.joinConfig.channelId;
  const channel = channelId ? guild.channels.cache.get(channelId) : undefined;
  const botVoice = guild.members.me?.voice;
  const listenerInstalled = connection ? hasSpeechListener(connection) : false;
  const speakingListeners = connection?.receiver.speaking.listenerCount('start') ?? 0;

  return [
    `Conectado: ${connection && connection.state.status !== VoiceConnectionStatus.Destroyed ? 'si' : 'no'}`,
    `Canal: ${channel?.name ?? channelId ?? 'ninguno'}`,
    `Estado conexion: ${connection?.state.status ?? 'sin conexion'}`,
    `Bot self mute: ${botVoice?.selfMute ? 'si' : 'no'}`,
    `Bot self deaf: ${botVoice?.selfDeaf ? 'si' : 'no'}`,
    `Bot server mute: ${botVoice?.serverMute ? 'si' : 'no'}`,
    `Bot server deaf: ${botVoice?.serverDeaf ? 'si' : 'no'}`,
    `Listener speech: ${listenerInstalled ? 'instalado' : 'no instalado'}`,
    `Listeners speaking: ${speakingListeners}`,
    `Idioma STT: ${serverData?.speechOptions?.lang ?? 'es-ES'}`,
    `Debug logs: ${isDebugLogsEnabled() ? 'on' : 'off'}`,
    `Alias usuarios: ${Object.keys(serverData?.aliasUsers ?? {}).length}`,
    `Canales configurados: ${Object.keys(serverData?.moveChannels ?? {}).length}`,
  ];
}
