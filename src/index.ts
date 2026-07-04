import { ActivityType, Client, GatewayIntentBits, VoiceState } from 'discord.js';
import dotenv from 'dotenv';
import { EventEmitter } from 'events';
import { executeCommand, registerCommands } from './handler/command-handler';
import { addServerData, getServerData, setAudioPlayer, setConnection, setServerSpeechOptions, startServerData } from './util/server-data';
import { addSpeechEvent, SpeechOptions } from 'discord-speech-recognition';
import { disconnectOnLoad } from './util/disconnect-on-load';
import { handleSpeech } from './handler/speech-handler';
import { handleInteraction } from './handler/interaction-handler';
import { executeJoin } from './command/join';
dotenv.config();

EventEmitter.defaultMaxListeners = 20;

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN as string;

export const client = new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildPresences,
  ] });

client.once("ready", async () => {
    console.log(`Logged in as ${client.user?.tag}!`);
    client.user?.setActivity('Voice Commands', { type: ActivityType.Listening });
    disconnectOnLoad(client);
    await registerCommands();
    startServerData();

    client.guilds.cache.forEach(async guild => {
        const lang = getServerData(guild.id)?.lang;
        if(lang){
            const speechOptions : SpeechOptions = addSpeechEvent(client);
            speechOptions.lang = lang;
            speechOptions.profanityFilter = false;
            setServerSpeechOptions(speechOptions, guild.id);
            //console.log(`Config for this guild ${guild.id}:`, getServerData(guild.id));
        }else {
            const speechOptions : SpeechOptions = addSpeechEvent(client);
            speechOptions.lang = 'es-ES';
            speechOptions.profanityFilter = false;
            addServerData(guild.id, {}, {}, false, 'es-ES', speechOptions, undefined, undefined);
        }
    });
});

client.on('interactionCreate', async (interaction: any) => {
    if(!interaction.guild){
      interaction.reply('This command can only be used in a server');
      return;
    }

    if (interaction.isCommand()){
        executeCommand(interaction, interaction.commandName);
    }else{
        handleInteraction(interaction);
    }
});

client.on("guildCreate", (guild) => {
    const speechOptions : SpeechOptions = addSpeechEvent(client);
    speechOptions.lang = 'es-ES';
    speechOptions.profanityFilter = false;
    addServerData(guild.id, {}, {}, false, 'es-ES', speechOptions, undefined, undefined);
});

client.on('voiceStateUpdate', async (oldState: VoiceState, newState: VoiceState) => {
    const botId = client.user?.id;
    if (!botId) {
        return;
    }

    if (oldState.member?.user.id === botId) {
        const wasInChannel = oldState.channelId;
        const isInChannel = newState.channelId;

        if (wasInChannel && !isInChannel) {
            console.log('El bot se ha desconectado del canal de voz.');
            setConnection(undefined, oldState.guild.id);
            setAudioPlayer(undefined, oldState.guild.id);
        }
        return;
    }

    const botMember = await newState.guild.members.fetch(botId);
    const guildMember = newState.member ?? await newState.guild.members.fetch(newState.id);
    const botVoiceChannel = botMember.voice.channel;
    const serverData = getServerData(newState.guild.id);
    const userHasJustMuted = !oldState.selfMute && newState.selfMute;

    // Autojoin: solo cuando un usuario se silencia a si mismo.
    if (newState.channel && newState.member?.id !== botId && !botVoiceChannel && serverData?.auto_connect && userHasJustMuted) {
        const interaction = {
            guildId: newState.guild.id,
            user: { id: newState.member?.id },
            member: guildMember,
            guild: newState.guild,
            reply: async (message: string | object) => console.log('Reply:', message),
        };

        await executeJoin(interaction);
    }

    // Si el bot se queda solo en su canal, cerramos la conexion de voz y limpiamos el estado local.
    const currentBotChannel = botMember.voice.channel;
    if (!currentBotChannel) {
        return;
    }

    const humanMembersInChannel = currentBotChannel.members.filter(member => !member.user.bot);
    if (humanMembersInChannel.size === 0) {
        serverData?.connection?.destroy();
        botMember.voice.disconnect().catch(() => undefined);
        setConnection(undefined, newState.guild.id);
        setAudioPlayer(undefined, newState.guild.id);
        console.log(`Me he desconectado del canal: ${currentBotChannel.name} porque no hay mas usuarios.`);
    }
});
client.on('speech', handleSpeech);

client.login(BOT_TOKEN);
