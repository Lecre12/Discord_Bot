import { Client, GatewayIntentBits, VoiceState } from 'discord.js';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { EventEmitter } from 'events';
import { executeCommand, registerCommands } from './handler/command-handler';
import { addServerData, getServerData, getServersData, setConnection, setServerSpeechOptions, startServerData } from './util/server-data';
import { addSpeechEvent, SpeechOptions } from 'discord-speech-recognition';
import { disconnectOnLoad } from './util/disconnect-on-load';
import { handleSpeech } from './handler/speech-handler';
import { handleInteraction } from './handler/interaction-handler';
dotenv.config();

EventEmitter.defaultMaxListeners = 20;

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN as string
export const openIa = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const client = new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildPresences,
  ] });

client.once("ready", async () => {
    console.log(`Logged in as ${client.user?.tag}!`);

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
            speechOptions.lang = 'es';
            speechOptions.profanityFilter = false;
            addServerData(guild.id, {}, {}, false, 'es', speechOptions, undefined, undefined);
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
    speechOptions.lang = 'es';
    speechOptions.profanityFilter = false;
    addServerData(guild.id, {}, {}, false, 'es', speechOptions, undefined, undefined);
});

client.on('voiceStateUpdate', (oldState: VoiceState, newState: VoiceState) => {
    const botId = client.user?.id;
  
    // Comprobamos si el bot era el que estaba en el canal
    if (oldState.member?.user.id === botId) {
      const wasInChannel = oldState.channelId;
      const isInChannel = newState.channelId;
  
      if (wasInChannel && !isInChannel) {
        console.log('🔌 El bot se ha desconectado del canal de voz.');
        setConnection(undefined, oldState.guild.id);
      }
    }
  });

client.on('speech', handleSpeech);

client.login(BOT_TOKEN);