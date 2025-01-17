import { ActivityType, Client, GatewayIntentBits, VoiceState } from 'discord.js';
import dotenv from 'dotenv';
import { registerCommands } from './handlers/command-handler';
import { exeCommand } from './handlers/command-handler'
import { getConfig } from './util/bot-config';
import { handleInteraction } from './commands/configuration';
import { addSpeechEvent, SpeechOptions } from 'discord-speech-recognition';
import { executeJoin } from './commands/join';
import { OpenAI } from 'openai';
import { handleSpeech } from './handlers/speechHandler';
const { EventEmitter } = require('events');
import { Semaphore } from './util/semaphore';
import fs from 'fs';
import path from 'path';
EventEmitter.defaultMaxListeners = 0;

dotenv.config();

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN as string
export const openIa = new OpenAI({
  apiKey: "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"
});

export const serverData = new Map<string, { aliasUsers: { [key: string]: string }, moveChannels: { [key: string]: string }, connect:boolean, lang: string, speechOptions: SpeechOptions}>();

export function getLang(guildId: string): string | undefined{
  return serverData.get(guildId)?.lang;
}
export function setLang(newLang: string, guildId: string){
  const data = serverData.get(guildId);
  data!.speechOptions.lang = newLang;
  serverData.set(guildId, {
    aliasUsers: data!.aliasUsers,
    moveChannels: data!.moveChannels,
    connect: data!.connect,
    lang: newLang,
    speechOptions: data!.speechOptions
  });
}

export const client = new Client({ intents: [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildVoiceStates,
  GatewayIntentBits.MessageContent,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.GuildPresences,
] });

export const semUpdateStatus = new Semaphore(1);


client.once('ready', async () => {
  console.log(`Logged in as ${client.user?.tag}!`);

  client.user?.setActivity('VoiceCommands', { type: ActivityType.Listening });

  let totalConnections = 0;
    for (const [_, guild] of client.guilds.cache) {
        const voiceStates = guild.voiceStates.cache;
        for (const [_, voiceState] of voiceStates) {
            if (voiceState.channel && voiceState.member?.id === client.user?.id) {
                voiceState.disconnect();
                totalConnections++;
            }
        }
    }
  console.log("Cerradas " + totalConnections + " conexiones");
  deleteAllFilesInFolder(path.resolve(__dirname, '../songs/'));
  await registerCommands();
  client.guilds.cache.forEach(async guild => {
    const config = await getConfig(guild.id);
    if (config) {
      let speechOptions : SpeechOptions = addSpeechEvent(client);
      console.log(`Loaded config for guild ${guild.id}:`, config);
      const lang = config.LANG;
      speechOptions.lang = lang;
      speechOptions.profanityFilter = false;
      serverData.set(guild.id, {
        aliasUsers: config.USERS,
        moveChannels: config.CHANNELS,
        connect: config.CONNECT,
        lang: lang,
        speechOptions: speechOptions
      });
      console.log(`Language for this guild: ${lang}`);
      console.log(client.listenerCount("speech"));
    }
  });

});

client.on('interactionCreate', async (interaction: any) => {
  if(!interaction.guild){
    interaction.reply('This command can only be used in a server')
    return;
  }

  if (interaction.isCommand()){
    exeCommand(interaction, interaction.commandName)
  }else{
    handleInteraction(interaction)
  }
});

client.on('guildCreate', (guild) =>{
  const config = getConfig(guild.id as string);
  if(config){
    console.log(`Loaded config for guild ${guild.id}:`, config);

    // Utilizar la configuración cargada
    const lang = config.LANG;
    console.log(`Language for this guild: ${lang}`);
  }
});

client.on('voiceStateUpdate', async (oldState: VoiceState, newState: VoiceState) => {
  await semUpdateStatus.acquire();

  const botMember = await newState.guild.members.fetch(client.user!.id);
  const botVoiceChannel = botMember.voice.channel?.id;
  // Verificar si el miembro que se ha unido es alguien que no es el bot
  if (newState.channel && newState.member?.id !== client.user?.id && !botVoiceChannel && serverData.get(oldState.guild.id)?.connect) {
    // Simular la ejecución del comando /join
    const interaction = {
      guildId: newState.guild.id,
      user: { id: newState.member?.id },
      guild: newState.guild,
      reply: async (message: string) => console.log('Reply:', message),
    };

    executeJoin(interaction);
  }

  // Verificar si el bot está solo en el canal de voz
  if (oldState.channel) {
    const channel = oldState.channel;
    const botMember = channel.guild.members.me;
    if(channel.members.has(oldState.client.user!.id)){
      const membersInChannel = channel.members.filter(member => !member.user.bot); // Excluir bots
      if (membersInChannel.size === 0) {
        // Si no hay más usuarios (excepto el bot) en el canal, desconectar el bot
        botMember?.voice.disconnect();
        console.log(`Me he desconectado del canal: ${channel.name} porque no hay más usuarios.`);
      }
    }
    
  }

  semUpdateStatus.release();
});

client.on('speech', handleSpeech);

client.login(BOT_TOKEN);

export function deleteAllFilesInFolder(folderPath: string): void {
  try {
      const files = fs.readdirSync(folderPath); // Leer todos los archivos en la carpeta
      files.forEach((file) => {
          const filePath = path.join(folderPath, file);
          if (fs.statSync(filePath).isFile()) { // Verificar si es un archivo
              fs.unlinkSync(filePath); // Eliminar el archivo
              console.log(`Archivo eliminado: ${filePath}`);
          }
      });
      console.log(`Todos los archivos en '${folderPath}' han sido eliminados.`);
  } catch (err) {
      console.error(`Error al intentar borrar los archivos: ${err}`);
  }
}