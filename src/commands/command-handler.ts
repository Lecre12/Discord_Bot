import { Routes, REST, SlashCommandBuilder, Client, PermissionFlagsBits } from 'discord.js';
import dotenv from 'dotenv';
import { pingCommand, executePing } from './ping'
import { joinCommand, executeJoin } from './join';
import { configurationCommand, executeAddMenu, executeGlobalConfiguration } from './configuration';
import { getConfig } from '../util/bot-config';

dotenv.config()

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN as string 
const CLIENT_ID = process.env.CLIENT_ID as string

const commands =[
    pingCommand.toJSON(),
    joinCommand.toJSON(),
    configurationCommand.setDefaultMemberPermissions(PermissionFlagsBits.Administrator).toJSON(),
    new SlashCommandBuilder().setName('help').setDescription('Prints commands for help').toJSON(),
    new SlashCommandBuilder().setName('addmember').setDescription('Add a member to de list who the bot can interact with').setDefaultMemberPermissions(PermissionFlagsBits.Administrator).toJSON(),
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

export async function exeCommand(interaction : any, commandName : string, client: Client){
  const config = getConfig(interaction.guildId as string)
  switch(commandName){
    case 'join':
      executeJoin(interaction, client)
      break;
    case 'configuration':
      const member = interaction.member;
      executeGlobalConfiguration(interaction)
      break
    case 'ping':
      executePing(interaction)
      break
    case 'addmember':
      executeAddMenu(interaction)
      break
    case 'help':
      switch(config.LANG){
        case 'EN':
          interaction.reply({ content: "1. /help -> show this message\n" +
                                      "2. /configuration -> Configure bot properties\n" +
                                      "3. /join -> joins voice channel and start listenning to voice commands\n\n" +
                                      "VOICE COMMANDS:\n" +
                                      "1. 'disconnect + server username'", ephemeral: true})
          break
        case 'ES':
          interaction.reply({ content: "1. /help -> muestra este mensaje\n" +
            "2. /configuration -> Configura las propiedades del bot\n" +
            "3. /join -> se mete al canal de voz y empieza a escuchar comandos de voz\n\n" +
            "VOICE COMMANDS:\n" +
            "1. 'oye marrón expulsa + nombre de usuario' (o 'todos')" +
            "2. 'oye marrón alerta'" +
            "3. 'oye marrón numero aleatorio/random'" +
            "4. 'oye marrón silencia + nombre usuario'" + 
            "5. 'oye marrón desilencia'", ephemeral: true})
          break
        default:
          interaction.reply({ content: "1. /help -> show this message\n" +
            "2. /configuration -> Configure bot properties\n" +
            "3. /join -> joins voice channel and start listenning to voice commands\n\n" +
            "VOICE COMMANDS:\n" +
            "1. 'disconnect + server username'", ephemeral: true})
          break
      }
      break
    default:
      await interaction.reply({ content: "Mi rey ese puto comando no tengo ni idea de lo que pollas hace, un cordial saludo", ephemeral: true})
      break
  }
}