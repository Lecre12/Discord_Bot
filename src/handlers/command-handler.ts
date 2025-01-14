import { Routes, REST, SlashCommandBuilder, Client, PermissionFlagsBits, ChannelType } from 'discord.js';
import dotenv from 'dotenv';
import { pingCommand, executePing } from '../commands/ping'
import { joinCommand, executeJoin } from '../commands/join';
import { configurationCommand, executeGlobalConfiguration } from '../commands/configuration';
import { getConfig } from '../util/bot-config';
import { executeAddUserMenuSpanish } from '../lang/add-user/add-user-spanish';
import { serverData } from '../index';
import { executeAddChannelMenuSpanish } from '../lang/add-channel/add-channel-spanish';
import { executeAddChannelMenuEnglish } from '../lang/add-channel/add-channel-english';
import { executeAddUserMenuEnglish } from '../lang/add-user/add-user-english';

dotenv.config()

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN as string 
const CLIENT_ID = process.env.CLIENT_ID as string

const commands =[
    pingCommand.toJSON(),
    joinCommand.toJSON(),
    configurationCommand.setDefaultMemberPermissions(PermissionFlagsBits.Administrator).toJSON(),
    new SlashCommandBuilder().setName('help').setDescription('Prints commands for help').toJSON(),
    new SlashCommandBuilder().setName('addmember').setDescription('Add a member to de list who the bot can interact with').setDefaultMemberPermissions(PermissionFlagsBits.Administrator).
    addUserOption((option) =>
      option.setName("user").setDescription("User that the bot can recognize").setRequired(true)
    ).addStringOption((option) =>
      option.setName("alias").setDescription("Alias of the user").setRequired(true)
    ).toJSON(),
    new SlashCommandBuilder().setName('addchannel').setDescription('Add a channel so the bot can move to channels').setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption((option) =>
      option.setName("channel").setDescription("Voice channel that the bot has to recognize to move").setRequired(true).addChannelTypes(ChannelType.GuildVoice))
    .addStringOption((option) =>
      option.setName("alias").setDescription("Channel alias").setRequired(true)
    ).toJSON(),
];

const rest = new REST({ version: '9' }).setToken(BOT_TOKEN);
const languageSupportedAddUserHandlers: Record<string, (interaction: any, handlerContext: HandlerContext) => Promise<void>> = {
  'en-EN': executeAddUserMenuEnglish,
  'es-ES': executeAddUserMenuSpanish,
};
const languageSupportedAddChannelHandlers: Record<string, (interaction: any, handlerContext: HandlerContext) => Promise<void>> = {
  'en-EN': executeAddChannelMenuEnglish,
  'es-ES': executeAddChannelMenuSpanish,
};

export async function registerCommands() {
    try {
      console.log('Started refreshing application (/) commands.');
  
      await rest.put(
        Routes.applicationCommands(CLIENT_ID),
        { body: commands },
      );
  
      console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
      console.error('Error registering commands:', error);
    }
  }

export async function exeCommand(interaction : any, commandName : string, client: Client){
  const config = getConfig(interaction.guildId as string);
  switch(commandName){
    case 'join':
      executeJoin(interaction)
      break;
    case 'configuration':
      const member = interaction.member;
      executeGlobalConfiguration(interaction)
      break
    case 'ping':
      executePing(interaction)
      break
    case 'addmember':
      const handlerUser = languageSupportedAddUserHandlers[serverData.get(interaction.guildId)!.lang];
        if(handlerUser){
          const context : HandlerContext = {
            selectedLanguage :  '',
            selectedChannel1 :  '',
            selectedChannel2 :  '',
            selectedMoveChannel : '',
            initialConnectCheckBox :'',
            userId :''
          };
          await handlerUser(interaction, context);
        }else{
          console.log("Idioma no soportado: " + serverData.get(interaction.guildId)!.lang);
        }
      break
    case 'addchannel':
      const handlerChannel = languageSupportedAddChannelHandlers[serverData.get(interaction.guildId)!.lang];
        if(handlerChannel){
          const context : HandlerContext = {
            selectedLanguage :  '',
            selectedChannel1 :  '',
            selectedChannel2 :  '',
            selectedMoveChannel : '',
            initialConnectCheckBox :'',
            userId :''
          };
          await handlerChannel(interaction, context);
        }else{
          console.log("Idioma no soportado: " + serverData.get(interaction.guildId)!.lang);
        }
      break
    case 'help':
      switch(config.LANG){
        case 'en-EN':
          interaction.reply({ content: "1. /help -> show this message\n" +
                                      "2. /configuration -> Configure bot properties\n" +
                                      "3. /join -> joins voice channel and start listenning to voice commands\n\n" +
                                      "VOICE COMMANDS:\n" +
                                      "1. 'disconnect + alias username'", ephemeral: true})
          break
        case 'es-ES':
          interaction.reply({ content: "1. /help -> muestra este mensaje\n" +
            "2. /configuration -> Configura las propiedades del bot\n" +
            "3. /join -> se mete al canal de voz y empieza a escuchar comandos de voz\n" +
            "4. /addmember -> añade un usuario con un alias para que el bot lo reconozca\n" +
            "5. /addchannel -> añade un acnal para que el bot lo reconozca con un alias\n\n" +
            "VOICE COMMANDS:\n" +
            "1. 'oye marrón expulsa + alias usuario' (o 'todos')\n" +
            "2. 'oye marrón alerta'\n" +
            "3. 'oye marrón numero aleatorio/random'\n" +
            "4. 'oye marrón silencia + alias usuario'\n" +
            "5. 'oye marron ensordece + alias usuario'\n" + 
            "6. 'oye marrón habla' -> desmutea y desensordece a todos los usuarios del canal\n" +
            "7. 'oye marrón mueve/mover + alias canal destino\n" +
            "8. 'oye marron quien esta conectado -> cita los miembros conectados y si se dice voz/discord tambien les manda un mensaje diciendoles que se metan a voz\n" +
            "9. 'oye marrón piensa promt' -> pregunta a chatgpt algo", ephemeral: true})
          break
        default:
          interaction.reply({ content: "1. /help -> show this message\n" +
            "2. /configuration -> Configure bot properties\n" +
            "3. /join -> joins voice channel and start listenning to voice commands\n\n" +
            "VOICE COMMANDS:\n" +
            "1. 'disconnect + alias username'", ephemeral: true})
          break
      }
      break
    default:
      await interaction.reply({ content: "Mi rey ese puto comando no tengo ni idea de lo que pollas hace, un cordial saludo", ephemeral: true})
      break
  }
}