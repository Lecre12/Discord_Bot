import { VoiceChannel } from "discord.js";
import { serverData } from "../../index";
import { getConfig, updateConfig, createConfig } from "../../util/bot-config";

export async function executeAddChannelMenuSpanish(interaction: any, handlerContext: HandlerContext){
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
        content: 'Canal guardado como ' + alias.toLowerCase(),
        components: [],
        ephemeral: true,
      });
    }else{
      createConfig(interaction.guildId)
    }
}