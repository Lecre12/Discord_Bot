import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelSelectMenuBuilder, ChannelType, SlashCommandBuilder, StringSelectMenuBuilder, SystemChannelFlagsString } from 'discord.js';
import { updateConfig, getConfig} from '../util/bot-config';

let selectedLanguage : string = ''
let selectedChannel1 : string = ''
let selectedChannel2 : string = ''

export const configurationCommand = new SlashCommandBuilder()
  .setName('configuration')
  .setDescription('Opens the bot configuration');

export async function executeConfiguration(interaction: any) {
  
  let selectLanguageMenu;
  let channelSelectMenu1, channelSelectMenu2
  let confirmButton
  let row, row2, row3, row4;
  const config = getConfig(interaction.guildId as string)
  switch(config.LANG){
    case 'en-EN':
      selectLanguageMenu = new StringSelectMenuBuilder()
      .setCustomId('language_select')
      .setPlaceholder('Select a lenguage')
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
            .setPlaceholder("First channel to move the persons")
            .setChannelTypes([ChannelType.GuildVoice, ChannelType.GuildStageVoice]);
      channelSelectMenu2 = new ChannelSelectMenuBuilder()
            .setCustomId("voice-channel-select2")
            .setPlaceholder("Second channel to move the persons")
            .setChannelTypes([ChannelType.GuildVoice, ChannelType.GuildStageVoice]);

        row = new ActionRowBuilder().addComponents(selectLanguageMenu);
        row2 = new ActionRowBuilder().addComponents(channelSelectMenu1);
        row3 = new ActionRowBuilder().addComponents(channelSelectMenu2);
        row4 = new ActionRowBuilder().addComponents(confirmButton);

      // Enviar la respuesta con las filas separadas
      
      await interaction.reply({
        content: 'Please choose a language and then confirm.',
        components: [row, row2, row3, row4],
        ephemeral: true,
      });

      break
      case 'es-ES':
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

        row = new ActionRowBuilder().addComponents(selectLanguageMenu);
        row2 = new ActionRowBuilder().addComponents(channelSelectMenu1);
        row3 = new ActionRowBuilder().addComponents(channelSelectMenu2);
        row4 = new ActionRowBuilder().addComponents(confirmButton);

        // Enviar la respuesta con las filas separadas
        
        await interaction.reply({
          content: 'Elija un idioma y después confirme, gracias',
          components: [row, row2, row3, row4],
          ephemeral: true,
        });
      break
      default:
        selectLanguageMenu = new StringSelectMenuBuilder()
        .setCustomId('language_select')
        .setPlaceholder('Select a lenguage')
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
            .setPlaceholder("First channel to move the persons")
            .setChannelTypes([ChannelType.GuildVoice, ChannelType.GuildStageVoice]);
        channelSelectMenu2 = new ChannelSelectMenuBuilder()
            .setCustomId("voice-channel-select2")
            .setPlaceholder("Second channel to move the persons")
            .setChannelTypes([ChannelType.GuildVoice, ChannelType.GuildStageVoice]);

        row = new ActionRowBuilder().addComponents(selectLanguageMenu);
        row2 = new ActionRowBuilder().addComponents(channelSelectMenu1);
        row3 = new ActionRowBuilder().addComponents(channelSelectMenu2);
        row4 = new ActionRowBuilder().addComponents(confirmButton);

      // Enviar la respuesta con las filas separadas
      
      await interaction.reply({
        content: 'Please choose a language and then confirm.',
        components: [row, row2, row3, row4],
        ephemeral: true,
      });
        break
  }
}
export async function handleInteraction(interaction: any) {
  // Verifica que la interacción es de tipo select menu o button
  if (interaction.isStringSelectMenu()) {
    if (interaction.customId === 'language_select') {
      // Obtenemos el valor seleccionado
      selectedLanguage = interaction.values[0];
      interaction.deferUpdate()
    }
  } else if (interaction.isButton()) {
    if (interaction.customId === 'confirm_button') {
      if(selectedLanguage == ''){
        await interaction.update({
          content: 'You have to put a language',
          components: [],
          ephemeral: false,
        });
        return
      }
      const config = getConfig(interaction.guildId as string);
      config.LANG = selectedLanguage;
      config.CHANNEL1 = selectedChannel1
      config.CHANNEL2 = selectedChannel2
      updateConfig(interaction.guildId as string, config);

      await interaction.update({
        content: 'Your language preference has been saved!',
        components: [],
        ephemeral: false,
      });
    }
  }else if(interaction.isChannelSelectMenu()){
    if(interaction.customId === 'voice-channel-select1'){
      selectedChannel1 = interaction.values[0];
      interaction.deferUpdate()
    }else if(interaction.customId === 'voice-channel-select2'){
      selectedChannel2 = interaction.values[0];
      interaction.deferUpdate()
    }
  }
}
