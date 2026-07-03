import { MessageFlags, SlashCommandBuilder } from "discord.js";
import { getServerData, setAutoJoin } from "../util/server-data";

export const toggleAutoJoin = new SlashCommandBuilder()
  .setName('toggle-autojoin')
  .setDescription('Activa o desactiva el autojoin');

export async function executeToggleAutoJoin(interaction: any) {
    const data = getServerData(interaction.guildId as string);
    if (data) {
        data.auto_connect = !data.auto_connect;
        setAutoJoin(interaction.guildId as string, data.auto_connect);
        await interaction.reply({ content: data.auto_connect ? 'Autojoin activado' : 'Autojoin desactivado', flags: MessageFlags.Ephemeral,});
    } else {
        await interaction.reply({ content: 'No se encontró la configuración del servidor', flags: MessageFlags.Ephemeral,});
    }
}
