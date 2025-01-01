import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelSelectMenuBuilder, SlashCommandBuilder, StringSelectMenuBuilder, SystemChannelFlagsString } from 'discord.js';
import { updateConfig, getConfig} from '../util/bot-config';

let selectedLanguage : string = ''

export const configurationCommand = new SlashCommandBuilder()
  .setName('configuration')
  .setDescription('Opens the bot configuration');

export async function executeConfiguration(interaction: any) {
  
  let selectLanguageMenu;
  let confirmButton
  let row, row2;
  const config = getConfig(interaction.guildId as string)
  switch(config.LANG){
    case 'EN':
      selectLanguageMenu = new StringSelectMenuBuilder()
      .setCustomId('language_select')
      .setPlaceholder('Select a lenguage')
      .addOptions([
        { 
          label: 'English',
          value: 'EN',
        },
        {
          label: 'Spanish',
          value: 'ES',
        }
      ]);

      confirmButton = new ButtonBuilder()
      .setCustomId('confirm_button')
      .setLabel('Confirm')
      .setStyle(ButtonStyle.Primary);

      row = new ActionRowBuilder().addComponents(selectLanguageMenu);
      row2 = new ActionRowBuilder().addComponents(confirmButton);

      // Enviar la respuesta con las filas separadas
      
      await interaction.reply({
        content: 'Please choose a language and then confirm.',
        components: [row, row2],
        ephemeral: true,
      });

      break
      case 'ES':
        selectLanguageMenu = new StringSelectMenuBuilder()
      .setCustomId('language_select')
      .setPlaceholder('Selecciona un idioma')
      .addOptions([
        { 
          label: 'Inglés',
          value: 'EN',
        },
        {
          label: 'Español',
          value: 'ES',
        }
      ]);

      confirmButton = new ButtonBuilder()
      .setCustomId('confirm_button')
      .setLabel('Confirmar')
      .setStyle(ButtonStyle.Primary);
        row = new ActionRowBuilder().addComponents(selectLanguageMenu);
        row2 = new ActionRowBuilder().addComponents(confirmButton);

        // Enviar la respuesta con las filas separadas
        
        await interaction.reply({
          content: 'Elija un idioma y después confirme, gracias',
          components: [row, row2],
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
            value: 'EN',
          },
          {
            label: 'Spanish',
            value: 'ES',
          }
        ]);

        confirmButton = new ButtonBuilder()
        .setCustomId('confirm_button')
        .setLabel('Confirm')
        .setStyle(ButtonStyle.Primary);
        row = new ActionRowBuilder().addComponents(selectLanguageMenu);
        row2 = new ActionRowBuilder().addComponents(confirmButton);

        // Enviar la respuesta con las filas separadas
        
        await interaction.reply({
          content: 'Please choose a language and then confirm.',
          components: [row, row2],
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
      updateConfig(interaction.guildId as string, config);

      await interaction.update({
        content: 'Your language preference has been saved!',
        components: [],
        ephemeral: false,
      });
    }
  }
}
