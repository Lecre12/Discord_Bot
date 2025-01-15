import { MessageFlags, SlashCommandBuilder } from 'discord.js';

export const removeUserAlias = new SlashCommandBuilder()
  .setName('remove-user-alias')
  .setDescription('Removes an user alias')
  .addStringOption((option) =>
    option.setName("alias").setDescription("Alias of the user").setRequired(true));

export async function executeRemoveUserAlias(interaction: any) {
  await interaction.reply({ content: 'Not implemmented yet.', flags: MessageFlags.Ephemeral,});
}