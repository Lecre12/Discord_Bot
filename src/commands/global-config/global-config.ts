
import { StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, ChannelSelectMenuBuilder, ChannelType, ActionRowBuilder, Guild, MessageFlags } from "discord.js";
import { getMessage } from "../../lang/lang-manager";
import { LangKeys } from "../../lang/lang-keys";

let selectLanguageMenu;
let channelSelectMenu1, channelSelectMenu2
let initialConnectCheck
let confirmButton
let row, row2, row3, row4, row5;

export async function globalConfigMenu(interaction: any): Promise<void> {
    selectLanguageMenu = new StringSelectMenuBuilder()
        .setCustomId('language_select')
        .setPlaceholder(getMessage(LangKeys.PLACEHOLDER_LANGUAGE, interaction.guildId))
        .addOptions([
        { 
            label: getMessage(LangKeys.ENGLISH, interaction.guildId),
            value: 'en-US',
        },
        {
            label: getMessage(LangKeys.SPANISH, interaction.guildId),
            value: 'es-ES',
        }
        ]);
    
        confirmButton = new ButtonBuilder()
        .setCustomId('confirm_button')
        .setLabel(getMessage(LangKeys.CONTENT_BUTTON_CONFIRM, interaction.guildId))
        .setStyle(ButtonStyle.Primary);
    
        channelSelectMenu1 = new ChannelSelectMenuBuilder()
            .setCustomId("voice-channel-select1")
            .setPlaceholder(getMessage(LangKeys.PLACEHOLDER_CHANNEL1, interaction.guildId))
            .setChannelTypes([ChannelType.GuildVoice, ChannelType.GuildStageVoice]);
        channelSelectMenu2 = new ChannelSelectMenuBuilder()
            .setCustomId("voice-channel-select2")
            .setPlaceholder(getMessage(LangKeys.PLACEHOLDER_CHANNEL2, interaction.guildId))
            .setChannelTypes([ChannelType.GuildVoice, ChannelType.GuildStageVoice]);
        initialConnectCheck = new StringSelectMenuBuilder()
            .setCustomId('checkBox_connect')
            .setPlaceholder(getMessage(LangKeys.AUTOCONNECT, interaction.guildId))
            .addOptions([
                {
                label: 'false',
                value: 'false',
                },
                {
                label: 'true',
                value: 'true',
                }
            ]);
    
        row = new ActionRowBuilder().addComponents(selectLanguageMenu);
        row2 = new ActionRowBuilder().addComponents(channelSelectMenu1);
        row3 = new ActionRowBuilder().addComponents(channelSelectMenu2);
        row4 = new ActionRowBuilder().addComponents(confirmButton);
        row5 = new ActionRowBuilder().addComponents(initialConnectCheck);
        
    
        // Enviar la respuesta con las filas separadas
        
        await interaction.reply({
            content: getMessage(LangKeys.REPLY_GLOBAL_CONFIG, interaction.guildId),
            components: [row, row2, row3, row5, row4],
            flags: MessageFlags.Ephemeral,
        });
}