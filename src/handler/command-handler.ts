import { MessageFlags, REST, Routes } from "discord.js";
import { executePing, ping } from "../command/ping";
import dotenv from 'dotenv';
import { joinCommand, executeJoin } from "../command/join";
import { addUser, executeAddUserMenu } from "../command/add-user";
import { addChannelCommand, executeAddChannelMenu } from "../command/add-channel";

dotenv.config();

const commands =[
    ping.toJSON(),
    joinCommand.toJSON(),
    addUser.toJSON(),
    addChannelCommand.toJSON(),
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
        default: 
            interaction.reply({ content: "Mi rey ese puto comando no tengo ni idea de lo que pollas hace, un cordial saludo", flags: MessageFlags.Ephemeral})
            break;
    }
}