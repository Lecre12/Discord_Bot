import { ActivityType, Client, GatewayIntentBits, VoiceState } from 'discord.js';
import dotenv from 'dotenv';
import { registerCommands } from './commands/command-handler';  // Importa la función que registra los comandos
import { exeCommand } from './commands/command-handler'
import { getConfig } from './util/bot-config';
import { handleInteraction } from './commands/configuration';
import { addSpeechEvent, SpeechOptions } from 'discord-speech-recognition';
import { executeJoin } from './commands/join';
import { Semaphore } from './util/Semaphore';
import { OpenAI } from 'openai';
import { handleSpeechEvent } from './handlers/speechHandler';

dotenv.config();

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN as string
export let canDisconnect: boolean = true;
export const getCanDisconnect = () => canDisconnect;
export const setCanDisconnect = (value: boolean) => {
  canDisconnect = value;
};
export const sem = new Semaphore(1);
export const openIa = new OpenAI({
  apiKey: "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"
});

/*export let aliasUsers: { [key: string]: string } = {
  'jose': '503287642490929163',
  'victor': '563791870497652746',
  'herva': '529025750603530250',
  'hern': '622019620773298178',
  'pablo': '422445328655187979',
  'agus': '551850717585997825',
  'alegre': '584828984009687090', //Lecre
  'chip': '567777196048121856',
  'david': '477184236265406464',  // KOT
  'andy': '722875525017895034', //andy amigo chipi
};*/

/*export let moveChannels: {[key: string]: string} = {
  'aliasCanal': 'id_canal'
}

export function getBotToken(){
  return BOT_TOKEN
}*/

export const serverData = new Map<string, { aliasUsers: { [key: string]: string }, moveChannels: { [key: string]: string }, connect:boolean }>();

export const client = new Client({ intents: [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildVoiceStates,
  GatewayIntentBits.MessageContent,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.GuildPresences,
] });
const speechOptions : SpeechOptions = addSpeechEvent(client)

client.once('ready', async () => {
  console.log(`Logged in as ${client.user?.tag}!`);

  client.user?.setActivity('Comandos de voz', { type: ActivityType.Listening });

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
  console.log("Cerradas " + totalConnections + " conexiones")

  client.guilds.cache.forEach(guild => {
    const config = getConfig(guild.id);
    if (config) {
      console.log(`Loaded config for guild ${guild.id}:`, config);
      const lang = 'es-ES';
      speechOptions.lang = lang;
      speechOptions.profanityFilter = false;
      serverData.set(guild.id, {
        aliasUsers: config.USERS,
        moveChannels: config.CHANNELS,
        connect: config.CONNECT
      });
      console.log(`Language for this guild: ${lang}`);
    }
  });

  await registerCommands();
});

client.on('interactionCreate', async (interaction: any) => {
  if(!interaction.guild){
    interaction.reply('This command can only be used in a server')
    return;
  }

  if (interaction.isCommand()){
    exeCommand(interaction, interaction.commandName, client)
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
  }else{

  }
});

client.on('voiceStateUpdate', async (oldState: VoiceState, newState: VoiceState) => {
  const botMember = await newState.guild.members.fetch(client.user!.id);
  const botVoiceChannel = botMember.voice.channel;
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
  /*if (oldState.channel) {
    const channel = oldState.channel;
    const membersInChannel = channel.members.filter(member => !member.user.bot); // Excluir bots
    await sem.acquire();
    if (membersInChannel.size === 0 && canDisconnect) {
      // Si no hay más usuarios (excepto el bot) en el canal, desconectar el bot
      const connection = getVoiceConnection(channel.guild.id);
      if (connection) {
        connection.destroy();
        console.log(`Me he desconectado del canal: ${channel.name} porque no hay más usuarios.`);
      }
    
    sem.release();
  }}*/
});

client.on('speech', handleSpeechEvent)

client.login(BOT_TOKEN);