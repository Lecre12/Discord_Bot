import { MessageFlags, SlashCommandBuilder } from 'discord.js';

export const removeChannelAlias = new SlashCommandBuilder()
  .setName('remove-channel-alias')
  .setDescription('Removes a channel alias')
  .addStringOption((option) =>
    option.setName("alias").setDescription("Alias of the channel").setRequired(true));

export async function executeRemoveChannelAlias(interaction: any) {
  await interaction.reply({ content: 'Not implemmented yet.', flags: MessageFlags.Ephemeral,});
}