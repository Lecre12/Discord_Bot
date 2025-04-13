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
        let configMessage = `${getMessage(LangKeys.SERVER_CONFIGURATION, interaction.guildId as string)} \n`;
        configMessage += `${getMessage(LangKeys.LANGUAGE_CONFIG, interaction.guildId as string)} ${data.lang}\n`;
        configMessage += `${getMessage(LangKeys.AUTOCONNECT_CONFIG, interaction.guildId as string)}: ${data.auto_connect ? getMessage(LangKeys.ON, interaction.guildId as string) : getMessage(LangKeys.OFF, interaction.guildId as string)}\n`;
        
        configMessage += `\n${getMessage(LangKeys.USER_ALIAS_CONFIG, interaction.guildId as string)}\n`;
        for (const [alias, userId] of Object.entries(data.aliasUsers)) {
            configMessage += `${alias}: ${userId}\n`;
        }
        
        configMessage += `\n${getMessage(LangKeys.CHANNEL_CONFIG, interaction.guildId as string)}\n`;
        for (const [channelId, alias] of Object.entries(data.moveChannels)) {
            configMessage += `${channelId}: ${alias}\n`;
        }
        
        await interaction.reply({ content: configMessage, flags: MessageFlags.Ephemeral,});
    } else {
        await interaction.reply({ content: getMessage(LangKeys.SERVER_CONFIG_NOT_FOUND, interaction.guildId as string), flags: MessageFlags.Ephemeral,});
    }
}