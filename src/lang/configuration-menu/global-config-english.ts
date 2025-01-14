import { StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, ChannelSelectMenuBuilder, ChannelType, ActionRowBuilder } from "discord.js";

let selectLanguageMenu;
let channelSelectMenu1, channelSelectMenu2
let initialConnectCheck
let confirmButton
let row, row2, row3, row4, row5;

export async function globalConfigMenuEnglish(interaction: any): Promise<void> {
    selectLanguageMenu = new StringSelectMenuBuilder()
        .setCustomId('language_select')
        .setPlaceholder('Select a languaje')
        .addOptions([
        { 
            label: 'English',
            value: 'en-EN',
        },
        {
            label: 'Spanish',
            value: 'es-ES',
        }
        ]);
    
        confirmButton = new ButtonBuilder()
        .setCustomId('confirm_button')
        .setLabel('Confirm')
        .setStyle(ButtonStyle.Primary);
    
        channelSelectMenu1 = new ChannelSelectMenuBuilder()
            .setCustomId("voice-channel-select1")
            .setPlaceholder("First channel to which alerted users will move")
            .setChannelTypes([ChannelType.GuildVoice, ChannelType.GuildStageVoice]);
        channelSelectMenu2 = new ChannelSelectMenuBuilder()
            .setCustomId("voice-channel-select2")
            .setPlaceholder("Second channel to which alerted users will move")
            .setChannelTypes([ChannelType.GuildVoice, ChannelType.GuildStageVoice]);
        initialConnectCheck = new StringSelectMenuBuilder()
            .setCustomId('checkBox_connect')
            .setPlaceholder('Autoconnect')
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
            content: 'Build your config and accept, thx :)',
            components: [row, row2, row3, row5, row4],
            ephemeral: true,
        });
}