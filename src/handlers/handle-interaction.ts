import { SpeechOptions } from "discord-speech-recognition";
import { getConfig, updateConfig } from "../util/bot-config";
import { serverData } from "..";
import { getMessage } from "../lang/lang-manager";
import { LangKeys } from "../lang/lang-keys";
import { MessageFlags } from "discord.js";

let handlerContext : HandlerContext = {
  selectedLanguage :  '',
  selectedChannel1 :  '',
  selectedChannel2 :  '',
  selectedMoveChannel : '',
  initialConnectCheckBox :'',
  userId :''
};

export async function trueHandleInteraction(interaction: any): Promise<void>{

    if (interaction.isStringSelectMenu()) {
        if (interaction.customId === 'language_select') {
          // Obtenemos el valor seleccionado
          handlerContext.selectedLanguage = interaction.values[0];
          interaction.deferUpdate()
        }else if(interaction.customId === 'checkBox_connect'){
          handlerContext.initialConnectCheckBox = interaction.values[0];
          interaction.deferUpdate()
        }
      } else if (interaction.isButton()) {
        if (interaction.customId === 'confirm_button') {
          if(handlerContext.selectedLanguage == '' || handlerContext.selectedChannel1 == '' || handlerContext.selectedChannel2 == '' || handlerContext.initialConnectCheckBox == ''){
            await interaction.update({
              content: getMessage(LangKeys.ERR_FILL_FIELDS, interaction.guildId),
              components: [],
              flags: MessageFlags.Ephemeral,
            });
            return
          }
          const config = getConfig(interaction.guildId as string);
          config.LANG = handlerContext.selectedLanguage;
          config.CHANNEL1 = handlerContext.selectedChannel1
          config.CHANNEL2 = handlerContext.selectedChannel2
          const initConnect : boolean = JSON.parse(handlerContext.initialConnectCheckBox)
          config.CONNECT = initConnect

          const speechOptions: SpeechOptions = serverData.get(interaction.guildId)!.speechOptions;
          speechOptions.lang = config.LANG;
          serverData.set(interaction.guildId, {
            aliasUsers: config.USERS,
            moveChannels: config.CHANNELS,
            connect: config.CONNECT,
            lang: config.LANG,
            speechOptions: speechOptions
          })
          updateConfig(interaction.guildId as string, config);
    
          await interaction.update({
            content: getMessage(LangKeys.CONFIRMATION_CONFIG_SAVED, interaction.guildId),
            components: [],
            flags: MessageFlags.Ephemeral,
          });
        }
      }else if(interaction.isChannelSelectMenu()){
        if(interaction.customId === 'voice-channel-select1'){
          handlerContext.selectedChannel1 = interaction.values[0];
          interaction.deferUpdate();
        }else if(interaction.customId === 'voice-channel-select2'){
          handlerContext.selectedChannel2 = interaction.values[0];
          interaction.deferUpdate();
        }else if(interaction.customId === 'move_channel_select'){
          handlerContext.selectedMoveChannel = interaction.values[0];
          interaction.deferUpdate();
        }
      }else if(interaction.isUserSelectMenu()){
        if(interaction.customId === 'user_select'){
          handlerContext.userId = interaction.values[0];
          interaction.deferUpdate();
        }
      }
}