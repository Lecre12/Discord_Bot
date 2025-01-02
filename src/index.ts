import { Client, GatewayIntentBits, VoiceState } from 'discord.js';
import dotenv from 'dotenv';
import { registerCommands } from './commands/command-handler';  // Importa la función que registra los comandos
import { exeCommand } from './commands/command-handler'
import { getConfig } from './util/bot-config';
import { handleInteraction } from './commands/configuration';
import { addSpeechEvent, SpeechOptions } from 'discord-speech-recognition';
import { executeJoin, handleSpeechEvent } from './commands/join';
import { joinVoiceChannel } from '@discordjs/voice';

dotenv.config();

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN as string

export function getBotToken(){
  return BOT_TOKEN
}

const client = new Client({ intents: [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildVoiceStates,
  GatewayIntentBits.MessageContent,
  GatewayIntentBits.GuildMessages,
] });
const speechOptions : SpeechOptions = addSpeechEvent(client)

client.once('ready', async () => {
  console.log(`Logged in as ${client.user?.tag}!`);

  client.guilds.cache.forEach(guild => {
    const config = getConfig(guild.id);
    if (config) {
      console.log(`Loaded config for guild ${guild.id}:`, config);
      const lang = config.LANG;
      speechOptions.lang = lang;
      console.log(`Language for this guild: ${lang}`);
    }
  });

  await registerCommands();
});

client.on('interactionCreate', async (interaction) => {
  if(interaction.member)

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

client.on('speech', handleSpeechEvent)

client.login(BOT_TOKEN);