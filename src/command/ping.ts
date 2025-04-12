import { MessageFlags, SlashCommandBuilder } from 'discord.js';

export const ping = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Te devuelve una poronga, yeyyyy!');

export async function executePing(interaction: any) {
  await interaction.reply({ content: 'Porongaaaaaaaaaaaaaaaa! ', flags: MessageFlags.Ephemeral,});
}