import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelSelectMenuBuilder, ChannelType, StringSelectMenuBuilder } from "discord.js";

let selectLanguageMenu;
let channelSelectMenu1, channelSelectMenu2
let initialConnectCheck
let confirmButton
let row, row2, row3, row4, row5;

export async function globalConfigMenuSpanish(interaction: any): Promise<void> {
    selectLanguageMenu = new StringSelectMenuBuilder()
    .setCustomId('language_select')
    .setPlaceholder('Selecciona un idioma')
    .addOptions([
    { 
        label: 'Inglés',
        value: 'en-EN',
    },
    {
        label: 'Español',
        value: 'es-ES',
    }
    ]);

    confirmButton = new ButtonBuilder()
    .setCustomId('confirm_button')
    .setLabel('Confirmar')
    .setStyle(ButtonStyle.Primary);

    channelSelectMenu1 = new ChannelSelectMenuBuilder()
        .setCustomId("voice-channel-select1")
        .setPlaceholder("Primer canal al que se van a mover los individuos")
        .setChannelTypes([ChannelType.GuildVoice, ChannelType.GuildStageVoice]);
    channelSelectMenu2 = new ChannelSelectMenuBuilder()
        .setCustomId("voice-channel-select2")
        .setPlaceholder("Segundo canal al que se van a mover los individuos")
        .setChannelTypes([ChannelType.GuildVoice, ChannelType.GuildStageVoice]);
    initialConnectCheck = new StringSelectMenuBuilder()
        .setCustomId('checkBox_connect')
        .setPlaceholder('Autoconetarse')
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
        content: 'Cree su configuración y después confirme, gracias',
        components: [row, row2, row3, row5, row4],
        ephemeral: true,
    });
}