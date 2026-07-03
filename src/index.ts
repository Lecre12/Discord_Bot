import { ActivityType, Client, GatewayIntentBits, VoiceState } from 'discord.js';
import dotenv from 'dotenv';
import { EventEmitter } from 'events';
import { getVoiceConnection } from '@discordjs/voice';
import { SpeechEvents, SpeechOptions, VoiceMessage } from 'discord-speech-recognition';
import { ensureSpeechListening } from './command/join';
import { SPANISH_LOCALE } from './constant/language';
import { executeCommand, registerCommands } from './handler/command-handler';
import { handleInteraction } from './handler/interaction-handler';
import { enqueueSpeechMessage } from './handler/speech-handler';
import { debugLog, debugWarn, installDebugLogFilter } from './util/debug-log';
import { disconnectOnLoad } from './util/disconnect-on-load';
import { addServerData, getServerData, setAudioPlayer, setConnection, setServerSpeechOptions, startServerData } from './util/server-data';
import { DEFAULT_SPEECH_OPTIONS } from './util/speech-options';

dotenv.config();
installDebugLogFilter();

EventEmitter.defaultMaxListeners = 20;

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN as string;
let activeSpeechOptions: SpeechOptions | undefined;

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildPresences,
  ],
});

client.once('ready', async () => {
  console.log(`Conectado como ${client.user?.tag}.`);
  client.user?.setActivity('comandos de voz en español', { type: ActivityType.Listening });
  disconnectOnLoad(client);
  await registerCommands();
  startServerData();

  const speechOptions = DEFAULT_SPEECH_OPTIONS;
  activeSpeechOptions = speechOptions;
  client.on(SpeechEvents.voiceJoin, (connection) => {
    const guildId = connection?.joinConfig.guildId ?? 'desconocido';
    const channelId = connection?.joinConfig.channelId ?? 'desconocido';
    const speakingListeners = connection?.receiver.speaking.listenerCount('start') ?? 0;
    debugLog(`[Speech][VoiceJoin] guild=${guildId} channel=${channelId} speakingListeners=${speakingListeners} status=${connection?.state.status ?? 'sin-conexion'}`);
  });

  client.guilds.cache.forEach((guild) => {
    if (getServerData(guild.id)) {
      setServerSpeechOptions(speechOptions, guild.id);
      return;
    }

    addServerData(guild.id, {}, {}, false, SPANISH_LOCALE, speechOptions, undefined, undefined);
  });
});

client.on('interactionCreate', async (interaction: any) => {
  if (!interaction.guild) {
    await interaction.reply('Este comando solo se puede usar en un servidor');
    return;
  }

  if (interaction.isCommand()) {
    await executeCommand(interaction, interaction.commandName);
    return;
  }

  handleInteraction(interaction);
});

client.on('guildCreate', (guild) => {
  addServerData(guild.id, {}, {}, false, SPANISH_LOCALE, activeSpeechOptions ?? DEFAULT_SPEECH_OPTIONS, undefined, undefined);
});

client.on('voiceStateUpdate', async (oldState: VoiceState, newState: VoiceState) => {
  const botId = client.user?.id;
  if (!botId) return;

  if (oldState.member?.user.id === botId) {
    const wasInChannel = oldState.channelId;
    const isInChannel = newState.channelId;

    if (wasInChannel && !isInChannel) {
      console.log('El bot se ha desconectado del canal de voz.');
      setConnection(undefined, oldState.guild.id);
      setAudioPlayer(undefined, oldState.guild.id);
    }

    if (isInChannel) {
      const connection = getVoiceConnection(newState.guild.id);
      if (connection) {
        setConnection(connection, newState.guild.id);
        ensureSpeechListening(client, connection, newState.guild.id);
      }
    }
    return;
  }

  if (!oldState.channel) return;

  const channel = oldState.channel;
  const guildBotMember = channel.guild.members.me;
  if (!channel.members.has(botId)) return;

  // const membersInChannel = channel.members.filter((member) => !member.user.bot);
  // if (membersInChannel.size === 0) {
  //   guildBotMember?.voice.disconnect();
  //   console.log(`Me he desconectado de ${channel.name} porque no quedan usuarios.`);
  // }
});

client.on('speech', async (message: VoiceMessage) => {
  const author = message.author?.tag ?? message.author?.id ?? 'desconocido';
  if (message.error) {
    debugWarn(`[Speech][Recognized] Error STT guild=${message.guild.id} user=${author}:`, message.error);
  }

  if (!message.content?.trim()) {
    debugLog(`[Speech][Recognized] Sin texto guild=${message.guild.id} user=${author} channel=${message.channel.id} duration=${message.duration?.toFixed?.(2) ?? 'n/a'}s`);
    return;
  }

  debugLog(`[Speech][Recognized] guild=${message.guild.id} user=${author} channel=${message.channel.id} duration=${message.duration?.toFixed?.(2) ?? 'n/a'}s text="${message.content}"`);

  try {
    await enqueueSpeechMessage(message);
  } catch (err) {
    console.warn('Error procesando audio:', err);
  }
});

client.login(BOT_TOKEN);
