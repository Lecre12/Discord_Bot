import { SlashCommandBuilder } from 'discord.js';
import { globalConfigMenu } from './global-config/global-config';
import { trueHandleInteraction } from '../handlers/handle-interaction';

export const configurationCommand = new SlashCommandBuilder()
  .setName('configuration')
  .setDescription('Opens the bot configuration');

export async function executeGlobalConfiguration(interaction: any) {
  await globalConfigMenu(interaction);
}

export async function handleInteraction(interaction: any) {
  await trueHandleInteraction(interaction);
}
