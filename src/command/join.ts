import {
  createAudioPlayer,
  getVoiceConnection,
  joinVoiceChannel,
  VoiceConnection,
  VoiceConnectionStatus,
} from '@discordjs/voice';
import { MessageFlags, SlashCommandBuilder } from 'discord.js';
import { LangKeys } from '../lang/lang-keys';
import { getMessage } from '../lang/lang-manager';
import { debugLog } from '../util/debug-log';
import { getServerData, setAudioPlayer, setConnection } from '../util/server-data';
import { attachSpeechListener, hasSpeechListener } from '../util/speech-listener';
import { DEFAULT_SPEECH_OPTIONS } from '../util/speech-options';

export const joinCommand = new SlashCommandBuilder()
  .setName('join')
  .setDescription('Se une a la llamada para escuchar comandos de voz en español');

const joinsInProgress = new Set<string>();
const readySpeechInstalledConnections = new WeakSet<VoiceConnection>();

async function reply(interaction: any, content: string, ephemeral = false): Promise<void> {
  const payload = ephemeral ? { content, flags: MessageFlags.Ephemeral } : { content };

  try {
    if (interaction.deferred && interaction.editReply) {
      await interaction.editReply({ content });
      return;
    }

    if (interaction.replied && interaction.followUp) {
      await interaction.followUp(payload);
      return;
    }

    await interaction.reply(payload);
  } catch (error: any) {
    if (error?.code === 10062 || error?.code === 40060) {
      return;
    }

    throw error;
  }
}

function isUsableConnection(connection: VoiceConnection | undefined): connection is VoiceConnection {
  return Boolean(connection && connection.state.status !== VoiceConnectionStatus.Destroyed);
}

function ensureSpeechNow(interaction: any, connection: VoiceConnection, guildId: string): void {
  if (!interaction.client) {
    debugLog(`[Voice][Join] No hay client para instalar speech guild=${guildId}`);
    return;
  }

  if (readySpeechInstalledConnections.has(connection) && hasSpeechListener(connection)) {
    debugLog(`[Voice][Join] Listener de speech ya instalado guild=${guildId}`);
    return;
  }

  const speechOptions = getServerData(guildId)?.speechOptions ?? DEFAULT_SPEECH_OPTIONS;

  readySpeechInstalledConnections.add(connection);
  attachSpeechListener(interaction.client, connection, speechOptions, true);
}

function ensureSpeechWhenReady(interaction: any, connection: VoiceConnection, guildId: string): void {
  const ensure = () => {
    debugLog(`[Voice][Join] Ready guild=${guildId} channel=${connection.joinConfig.channelId}`);
    ensureSpeechNow(interaction, connection, guildId);
  };

  if (connection.state.status === VoiceConnectionStatus.Ready) {
    ensure();
    return;
  }

  connection.on('stateChange', (_oldState, newState) => {
    debugLog(`[Voice][Join] Estado guild=${guildId} status=${newState.status}`);
    if (newState.status === VoiceConnectionStatus.Ready) {
      ensure();
    }
  });
}

export function ensureSpeechListening(client: any, connection: VoiceConnection, guildId: string): void {
  ensureSpeechWhenReady({ client }, connection, guildId);
}

export async function executeJoin(interaction: any) {
  let connection: VoiceConnection | undefined;
  const guildId = interaction.guildId as string;
  const serverData = getServerData(guildId);

  if (!serverData) {
    await reply(interaction, getMessage(LangKeys.SERVER_CONFIG_NOT_FOUND, guildId), true);
    return;
  }

  const existingConnection = serverData.connection ?? getVoiceConnection(guildId);
  if (isUsableConnection(existingConnection)) {
    setConnection(existingConnection, guildId);
    ensureSpeechWhenReady(interaction, existingConnection, guildId);
    await reply(interaction, getMessage(LangKeys.ERR_ALREADY_JOINED, guildId), true);
    return;
  }
  setConnection(undefined, guildId);

  if (joinsInProgress.has(guildId)) {
    await reply(interaction, 'Ya estoy intentando conectarme a un canal de voz.', true);
    return;
  }

  const voiceChannel = interaction.member?.voice.channel;
  if (!voiceChannel) {
    await reply(interaction, getMessage(LangKeys.ERR_NOT_ON_CHANNEL, guildId), true);
    return;
  }

  joinsInProgress.add(guildId);
  debugLog(`[Voice][Join] Inicio guild=${guildId} channel=${voiceChannel.id} name="${voiceChannel.name}" requestedBy=${interaction.user?.id ?? 'auto'}`);

  try {
    connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      selfDeaf: false,
    });

    const audioPlayer = createAudioPlayer();
    setAudioPlayer(audioPlayer, guildId);
    setConnection(connection, guildId);

    ensureSpeechWhenReady(interaction, connection, guildId);

    await reply(interaction, getMessage(LangKeys.JOIN_CHANNEL_REPLY, guildId) + voiceChannel.name);
  } catch (error) {
    console.warn(`No he podido crear la conexion de voz en guild=${guildId}:`, error);
    setConnection(undefined, guildId);
    setAudioPlayer(undefined, guildId);
    if (connection?.state.status !== VoiceConnectionStatus.Destroyed) {
      connection?.destroy();
    }
    await reply(interaction, 'No he podido conectarme bien al canal de voz. Prueba otra vez en unos segundos.', true);
  } finally {
    joinsInProgress.delete(guildId);
  }
}
