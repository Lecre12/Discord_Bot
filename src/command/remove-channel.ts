import { MessageFlags, SlashCommandBuilder } from "discord.js";
import { removeChannel, getServerData } from "../util/server-data";
import { PermissionFlagsBits } from "discord.js";
import { getMessage } from "../lang/lang-manager";
import { LangKeys } from "../lang/lang-keys";

export const removeChannelCommand = new SlashCommandBuilder()
  .setName('remove-channel')
  .setDescription('Elimina un canal configurado')
  .addChannelOption(option => option
    .setName('channel')
    .setDescription('El canal que quieres eliminar')
    .setRequired(true))
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function executeRemoveChannel(interaction: any) {
    const channel = interaction.options.getChannel("channel");
    const serverConfig = getServerData(interaction.guildId as string);

    if (serverConfig) {
        removeChannel(interaction.guildId as string, channel.id);
    }

    await interaction.reply({
        content: getMessage(LangKeys.CONFIRMATION_CHANNEL_DELETED, interaction.guildId as string),
        components: [],
        flags: MessageFlags.Ephemeral,
    });
}