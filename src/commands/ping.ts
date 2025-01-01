import { SlashCommandBuilder } from 'discord.js';

export const pingCommand = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Te devuelve una poronga, yeyyyy!');

export async function executePing(interaction: any) {
  await interaction.reply({ content: 'Pong! ', ephemeral: true});
}