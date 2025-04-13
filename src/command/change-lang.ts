import { MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { getServerData, setServerLang } from '../util/server-data';
import { getMessage } from '../lang/lang-manager';
import { LangKeys } from '../lang/lang-keys';

export const changeLang = new SlashCommandBuilder()
    .setName('change-lang')
    .setDescription('Cambia el idioma del bot')
    .addStringOption(option => option
        .setName('lang')
        .setDescription('El idioma al que quieres cambiar')
        .addChoices(
        { name: 'Español (España)', value: 'es-ES' },
        { name: 'English (United States)', value: 'en-US' }
        )
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
    
export async function executeChangeLang(interaction: any) {
    const lang = interaction.options.getString('lang') as string;
    const serverConfig = getServerData(interaction.guildId as string);
    if (serverConfig) {
        serverConfig.lang = lang;
        setServerLang(lang, interaction.guildId as string);
        await interaction.reply({ content: getMessage(LangKeys.CONFIRMATION_CHANGE_LANG, interaction.guildId as string), flags: MessageFlags.Ephemeral,});
    } else {
        await interaction.reply({ content: getMessage(LangKeys.SERVER_CONFIG_NOT_FOUND, interaction.guildId as string), flags: MessageFlags.Ephemeral,});
    }
}