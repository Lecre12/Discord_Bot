import { Routes, REST, SlashCommandBuilder, Client, PermissionFlagsBits, ChannelType, MessageFlags } from 'discord.js';
import dotenv from 'dotenv';
import { pingCommand, executePing } from '../commands/ping'
import { joinCommand, executeJoin } from '../commands/join';
import { configurationCommand, executeGlobalConfiguration } from '../commands/configuration';
import { executeHelp, helpCommand } from '../commands/help';
import { executeAddUserMenu } from '../commands/add-member';
import { executeAddChannelMenu } from '../commands/add-channel';

dotenv.config()

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN as string 
const CLIENT_ID = process.env.CLIENT_ID as string

const commands =[
    pingCommand.toJSON(),
    joinCommand.toJSON(),
    configurationCommand.setDefaultMemberPermissions(PermissionFlagsBits.Administrator).toJSON(),
    helpCommand.toJSON(),
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

export async function exeCommand(interaction : any, commandName : string){
  switch(commandName){
    case 'join':
      executeJoin(interaction);
      break;
    case 'configuration':
      executeGlobalConfiguration(interaction);
      break
    case 'ping':
      executePing(interaction);
      break
    case 'addmember':
      let context : HandlerContext = {
        selectedLanguage :  '',
        selectedChannel1 :  '',
        selectedChannel2 :  '',
        selectedMoveChannel : '',
        initialConnectCheckBox :'',
        userId :''
      };
      executeAddUserMenu(interaction, context);
      break
    case 'addchannel':
      let context2 : HandlerContext = {
        selectedLanguage :  '',
        selectedChannel1 :  '',
        selectedChannel2 :  '',
        selectedMoveChannel : '',
        initialConnectCheckBox :'',
        userId :''
      };
      executeAddChannelMenu(interaction, context2);
      break
    case 'help':
      await executeHelp(interaction);
    default:
      //await interaction.reply({ content: "Mi rey ese puto comando no tengo ni idea de lo que pollas hace, un cordial saludo", flags: MessageFlags.Ephemeral})
    break
  }
}