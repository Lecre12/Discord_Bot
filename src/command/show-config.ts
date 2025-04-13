import { MessageFlags, SlashCommandBuilder } from 'discord.js';
import { getServerData } from '../util/server-data';
import { LangKeys } from '../lang/lang-keys';
import { getMessage } from '../lang/lang-manager';
import { PermissionFlagsBits } from 'discord.js';

export const showConfig = new SlashCommandBuilder()
  .setName('show-config')
  .setDescription('Muestra la config del server')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function executeShowConfig(interaction: any) {
    const data = getServerData(interaction.guildId as string);
    if (data) {
        let configMessage = `Configuración del servidor: \n`;
        configMessage += `Idioma: ${data.lang}\n`;
        configMessage += `Auto connect: ${data.auto_connect ? 'Activado' : 'Desactivado'}\n`;
        
        configMessage += `\nAlias de usuarios:\n`;
        for (const [alias, userId] of Object.entries(data.aliasUsers)) {
            configMessage += `${alias}: ${userId}\n`;
        }
        
        configMessage += `\nCanales configurados:\n`;
        for (const [channelId, alias] of Object.entries(data.moveChannels)) {
            configMessage += `${channelId}: ${alias}\n`;
        }
        
        await interaction.reply({ content: configMessage, flags: MessageFlags.Ephemeral,});
    } else {
        await interaction.reply({ content: getMessage(LangKeys.SERVER_CONFIG_NOT_FOUND, interaction.guildId as string), flags: MessageFlags.Ephemeral,});
    }
}