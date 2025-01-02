import { AudioPlayerStatus } from '@discordjs/voice';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelSelectMenuBuilder, ChannelType, ModalBuilder, SlashCommandBuilder, StringSelectMenuBuilder, SystemChannelFlagsString, TextInputBuilder, TextInputStyle, UserSelectMenuBuilder } from 'discord.js';
import { updateConfig, getConfig} from '../util/bot-config';
import { aliasUsers, moveChannels } from '../index'

let selectedLanguage : string = ''
let selectedChannel1 : string = ''
let selectedChannel2 : string = ''
let selectedMoveChannel : string = ''
let userId : string = ''

export const configurationCommand = new SlashCommandBuilder()
  .setName('configuration')
  .setDescription('Opens the bot configuration');

export async function executeGlobalConfiguration(interaction: any) {
  
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
          label: 'English (does not work)',
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
          label: 'Inglés (No funciona)',
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
            label: 'English (does not work)',
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
          ephemeral: true,
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
    }else if(interaction.customId === 'confirm_button_users'){
      if(userId == ''){
        await interaction.update({
          content: 'Tienes que poner un usuario cazurro',
          components: [],
          ephemeral: true,
        });
        return
      }
      const modal = new ModalBuilder()
          .setCustomId('alias_modal')
          .setTitle('Escribe tu alias')
          .addComponents(
            // Asegurarse de que ActionRowBuilder sea específico para TextInputBuilder
            new ActionRowBuilder<TextInputBuilder>().addComponents(
              new TextInputBuilder()
                .setCustomId('alias_input')
                .setLabel('Escribe tu alias')
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
            )
          );
      await interaction.showModal(modal);
    }else if(interaction.customId === 'confirm_button_move_channel'){
      if(selectedMoveChannel == ''){
        await interaction.update({
          content: 'Tienes que poner un canal cazurro',
          components: [],
          ephemeral: true,
        });
        return
      }
      const modal = new ModalBuilder()
          .setCustomId('alias_modal_channel')
          .setTitle('Escribe tu alias')
          .addComponents(
            // Asegurarse de que ActionRowBuilder sea específico para TextInputBuilder
            new ActionRowBuilder<TextInputBuilder>().addComponents(
              new TextInputBuilder()
                .setCustomId('alias_input')
                .setLabel('Escribe tu alias')
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
            )
          );
      await interaction.showModal(modal);
    }
  }else if(interaction.isChannelSelectMenu()){
    if(interaction.customId === 'voice-channel-select1'){
      selectedChannel1 = interaction.values[0];
      interaction.deferUpdate()
    }else if(interaction.customId === 'voice-channel-select2'){
      selectedChannel2 = interaction.values[0];
      interaction.deferUpdate()
    }else if(interaction.customId === 'move_channel_select'){
      selectedMoveChannel = interaction.values[0];
      interaction.deferUpdate()
    }
  }else if(interaction.isUserSelectMenu()){
    if(interaction.customId === 'user_select'){
      userId = interaction.values[0];
      interaction.deferUpdate();
    }
  }else if(interaction.isModalSubmit()){
    if (interaction.customId === 'alias_modal') {
      const alias = interaction.fields.getTextInputValue('alias_input');
      aliasUsers[alias.toLowerCase()] = userId
      const config = getConfig(interaction.guildId as string);
      config.USERS = aliasUsers
      updateConfig(interaction.guildId as string, config);
      interaction.update({
        content: 'User guardado como ' + alias.toLowerCase(),
        components: [],
        ephemeral: true,
      });
    }else if(interaction.customId === 'alias_modal_channel'){
      const alias = interaction.fields.getTextInputValue('alias_input');
      moveChannels[alias.toLowerCase()] = selectedMoveChannel
      const config = getConfig(interaction.guildId as string);
      config.CHANNELS = moveChannels
      updateConfig(interaction.guildId as string, config);
      interaction.update({
        content: 'Canal guardado como ' + alias.toLowerCase(),
        components: [],
        ephemeral: true,
      });
    }
    
  }
}

export async function executeAddUserMenu(interaction: any){
  let selectUserMenu
  let confirmButton
  let row1, row3
  const config = getConfig(interaction.guildId as string)

  switch(config.LANG){
    case 'en-EN':

      break
    case 'es-ES':
      selectUserMenu = new UserSelectMenuBuilder()
      .setCustomId('user_select')
      .setPlaceholder('Selecciona un usuario')

      confirmButton = new ButtonBuilder()
      .setCustomId('confirm_button_users')
      .setLabel('Confirmar')
      .setStyle(ButtonStyle.Primary);

      row1 = new ActionRowBuilder().addComponents(selectUserMenu);
      row3 = new ActionRowBuilder().addComponents(confirmButton);

      await interaction.reply({
        content: 'Escoja su usuario y posteriormente su alias.',
        components: [row1, row3],
        ephemeral: true,
      });

      break
    default:
      break
  }
}

export async function executeAddChannelMenu(interaction: any){
  let selectchannelMenu
  let confirmButton
  let row1, row3
  const config = getConfig(interaction.guildId as string)

  switch(config.LANG){
    case 'en-EN':

      break
    case 'es-ES':
      selectchannelMenu = new ChannelSelectMenuBuilder()
      .setCustomId('move_channel_select')
      .setPlaceholder('Selecciona un canal')
      .addChannelTypes([ChannelType.GuildVoice, ChannelType.GuildStageVoice]);

      confirmButton = new ButtonBuilder()
      .setCustomId('confirm_button_move_channel')
      .setLabel('Confirmar')
      .setStyle(ButtonStyle.Primary);

      row1 = new ActionRowBuilder().addComponents(selectchannelMenu);
      row3 = new ActionRowBuilder().addComponents(confirmButton);

      await interaction.reply({
        content: 'Escoja su canal y posteriormente su alias.',
        components: [row1, row3],
        ephemeral: true,
      });

      break
    default:
      break
  }
}
