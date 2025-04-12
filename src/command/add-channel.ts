import { SlashCommandBuilder, MessageFlags, ChannelType, PermissionFlagsBits } from "discord.js";
import { getServerData, addChannel } from "../util/server-data";
import { addServerData } from "../util/server-data";

export const addChannelCommand = new SlashCommandBuilder()
  .setName('add-channel')
  .setDescription('Añade un canal de voz a la lista de canales')
  .addChannelOption(option => option
    .setName('channel')
    .setDescription('El canal de voz a añadir')
    .addChannelTypes(ChannelType.GuildVoice)
    .setRequired(true))
  .addStringOption(option => option
    .setName('alias')
    .setDescription('El alias del canal')
    .setRequired(true))
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function executeAddChannelMenu(interaction: any){
    const channel = interaction.options.getChannel("channel");
    const alias : string = interaction.options.getString("alias") as string;

    if(channel.type !== 2) {
        await interaction.reply({
            content: "Debes seleccionar un canal de voz",
            flags: MessageFlags.Ephemeral
        });
        return;
    }

    const serverConfig = getServerData(interaction.guildId as string);

    if(serverConfig) {
        serverConfig.moveChannels[channel.id] = alias.toLowerCase();
        addChannel(interaction.guildId as string, channel.id, alias);
    } else {
        addServerData(interaction.guildId as string, {}, { [channel.id]: alias.toLowerCase() }, false, 'es-ES', undefined, undefined, undefined);
    }

    await interaction.reply({
        content: `Canal ${channel.name} añadido correctamente como "${alias}"`,
        components: [],
        flags: MessageFlags.Ephemeral,
    });
}