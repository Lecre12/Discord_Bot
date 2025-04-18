import { MessageFlags, REST, Routes } from "discord.js";
import { executePing, ping } from "../command/ping";
import dotenv from 'dotenv';
import { joinCommand, executeJoin } from "../command/join";
import { addUser, executeAddUserMenu } from "../command/add-user";
import { addChannelCommand, executeAddChannelMenu } from "../command/add-channel";
import { executeHelp, helpCommand } from "../command/help";
import { changeLang, executeChangeLang } from "../command/change-lang";
import { showConfig, executeShowConfig } from "../command/show-config";
import { removeUserAliasCommand, executeRemoveUserAlias } from "../command/remove-user-alias";
import { executeRemoveChannel, removeChannelCommand } from "../command/remove-channel";
import { addCustomAudioCommand, executeAddCustomAudio } from "../command/add-custom-audio";
import { executeToggleAutoJoin, toggleAutoJoin } from "../command/toggle-autojoin";

dotenv.config();

const commands =[
    ping.toJSON(),
    joinCommand.toJSON(),
    addUser.toJSON(),
    addChannelCommand.toJSON(),
    helpCommand.toJSON(),
    changeLang.toJSON(),
    showConfig.toJSON(),
    removeUserAliasCommand.toJSON(),
    removeChannelCommand.toJSON(),
    addCustomAudioCommand.toJSON(),
    toggleAutoJoin.toJSON()
];

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN as string 
const CLIENT_ID = process.env.CLIENT_ID as string

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

export function executeCommand(interaction: any, commandName: string){
    switch(commandName){
        case 'ping':
            executePing(interaction);
            break;
        case 'join':
            executeJoin(interaction);
            break;
        case 'add-user':
            executeAddUserMenu(interaction);
            break;
        case 'add-channel':
            executeAddChannelMenu(interaction);
            break;
        case 'change-lang':
            executeChangeLang(interaction);
            break;
        case 'help':
            executeHelp(interaction);
            break;
        case 'show-config':
            executeShowConfig(interaction);
            break;
        case 'remove-user-alias':
            executeRemoveUserAlias(interaction);
            break;
        case 'remove-channel':
            executeRemoveChannel(interaction);
            break;
        case 'add-custom-audio':
            executeAddCustomAudio(interaction);
            break;
        case 'change-lang':
            executeChangeLang(interaction);
            break;
        case 'toggle-autojoin':
            executeToggleAutoJoin(interaction);
            break;
        default: 
            interaction.reply({ content: "Mi rey ese puto comando no tengo ni idea de lo que pollas hace, un cordial saludo", flags: MessageFlags.Ephemeral})
            break;
    }
}