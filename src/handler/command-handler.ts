import { MessageFlags, REST, Routes } from "discord.js";
import { executePing, ping } from "../command/ping";
import dotenv from 'dotenv';
import { joinCommand, executeJoin } from "../command/join";
import { addUser, executeAddUserMenu } from "../command/add-user";
import { addChannelCommand, executeAddChannelMenu } from "../command/add-channel";
import { executeHelp, helpCommand } from "../command/help";
import { showConfig, executeShowConfig } from "../command/show-config";
import { removeUserAliasCommand, executeRemoveUserAlias } from "../command/remove-user-alias";
import { executeRemoveChannel, removeChannelCommand } from "../command/remove-channel";
import { addCustomAudioCommand, executeAddCustomAudio } from "../command/add-custom-audio";
import { disconnectCommand, executeDisconnect } from "../command/disconnect";
import { debugCommand, executeDebug } from "../command/debug";
import { executeStatusVoice, statusVoiceCommand } from "../command/status-voice";
import { executePlay, playCommand } from "../command/play";
import { configPanelCommand, executeConfigPanel } from "../command/config-panel";
import { debugLog } from "../util/debug-log";
import { safeInteractionReply } from "../util/interaction-response";

dotenv.config();

const commands =[
    ping.toJSON(),
    joinCommand.toJSON(),
    addUser.toJSON(),
    addChannelCommand.toJSON(),
    helpCommand.toJSON(),
    showConfig.toJSON(),
    removeUserAliasCommand.toJSON(),
    removeChannelCommand.toJSON(),
    addCustomAudioCommand.toJSON(),
    disconnectCommand.toJSON(),
    debugCommand.toJSON(),
    statusVoiceCommand.toJSON(),
    playCommand.toJSON(),
    configPanelCommand.toJSON()
];

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN as string 
const CLIENT_ID = process.env.CLIENT_ID as string

const rest = new REST({ version: '9' }).setToken(BOT_TOKEN);
const registeredCommandNames = commands.map((command: any) => command.name).join(', ');

export async function registerCommands() {
  try {
    console.log(`Started refreshing application (/) commands: ${registeredCommandNames}`);
  
    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands },
    );
  
    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error('Error registering commands:', error);
  }
}

export async function executeCommand(interaction: any, commandName: string){
    const normalizedCommandName = commandName.trim().toLowerCase();

    try {
        debugLog(`[Command] Recibido /${commandName} normalizado=/${normalizedCommandName}`);
        switch(normalizedCommandName){
            case 'ping':
                await executePing(interaction);
                break;
            case 'join':
                await executeJoin(interaction);
                break;
            case 'add-user':
                await executeAddUserMenu(interaction);
                break;
            case 'add-channel':
                await executeAddChannelMenu(interaction);
                break;
            case 'help':
                await executeHelp(interaction);
                break;
            case 'show-config':
                await executeShowConfig(interaction);
                break;
            case 'remove-user-alias':
                await executeRemoveUserAlias(interaction);
                break;
            case 'remove-channel':
                await executeRemoveChannel(interaction);
                break;
            case 'add-custom-audio':
                await executeAddCustomAudio(interaction);
                break;
            case 'disconnect':
            case 'disconect':
            case 'leave':
                await executeDisconnect(interaction);
                break;
            case 'debug':
                await executeDebug(interaction);
                break;
            case 'status-voice':
            case 'status_voice':
            case 'statusvoice':
            case 'voice-status':
                await executeStatusVoice(interaction);
                break;
            case 'play':
                await executePlay(interaction);
                break;
            case 'config':
            case 'configuration':
                await executeConfigPanel(interaction);
                break;
            default: 
                console.warn(`[Command] No reconocido: /${commandName}. Este proceso conoce: ${registeredCommandNames}`);
                await safeInteractionReply(interaction, { content: "No reconozco ese comando.", flags: MessageFlags.Ephemeral });
                break;
        }
    } catch (error) {
        console.error(`Error ejecutando comando ${commandName}:`, error);
        await safeInteractionReply(interaction, { content: 'Ha ocurrido un error ejecutando el comando.', flags: MessageFlags.Ephemeral });
    }
}
