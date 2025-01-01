import { Routes, REST } from 'discord.js';
import dotenv from 'dotenv';
import { pingCommand, executePing } from './ping'
import { joinCommand, executeJoin } from './join';
import { configurationCommand, executeConfiguration } from './configuration';

dotenv.config()

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN as string 
const CLIENT_ID = process.env.CLIENT_ID as string

const commands =[
    pingCommand.toJSON(),
    joinCommand.toJSON(),
    configurationCommand.toJSON(),
];

const rest = new REST({ version: '9' }).setToken(BOT_TOKEN);

export async function registerCommands() {
    try {
      console.log('Started refreshing application (/) commands.');
  
      await rest.put(
        Routes.applicationCommands(CLIENT_ID), // Registra los comandos globalmente
        { body: commands },
      );
  
      console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
      console.error('Error registering commands:', error);
    }
  }

export async function exeCommand(interaction : any, commandName : string){
  switch(commandName){
    case 'join':
      executeJoin(interaction)
      break;
    case 'configuration':
      const member = interaction.member;
      if (!member.permissions.has('ADMINISTRATOR')) {
        await interaction.reply({ content: 'Lo siento, solo los administradores pueden usar este comando.', ephemeral: true });
        return;
      }
      executeConfiguration(interaction)
      break
    case 'ping':
      executePing(interaction)
      break
    default:
      await interaction.reply({ content: "Mi rey ese puto comando no tengo ni idea de lo que pollas hace, un cordial saludo", ephemeral: true})
      break
  }
}