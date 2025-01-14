import { VoiceChannel } from "discord.js";
import { serverData } from "..";
import { getConfig, updateConfig, createConfig } from "../util/bot-config";
import { getMessage } from "../lang/lang-manager";
import { LangKeys } from "../lang/lang-keys";


export async function executeAddChannelMenu(interaction: any, handlerContext: HandlerContext){
    const channel : VoiceChannel = interaction.options.getChannel("channel") as VoiceChannel;
    const alias : string = interaction.options.getString("alias") as string;
  
    const serverConfig = serverData.get(interaction.guildId);
  
    handlerContext.selectedMoveChannel = channel.id;
    if(serverConfig){
      const config = getConfig(interaction.guildId as string);
      serverConfig.moveChannels[alias.toLowerCase()] = handlerContext.selectedMoveChannel;
      config.CHANNELS = serverConfig.moveChannels
      updateConfig(interaction.guildId as string, config);
      interaction.reply({
        content: getMessage(LangKeys.CONFIRMATION_CHANNEL_SAVED, interaction.guildId) + alias.toLowerCase(),
        components: [],
        ephemeral: true,
      });
    }else{
      createConfig(interaction.guildId)
    }
}