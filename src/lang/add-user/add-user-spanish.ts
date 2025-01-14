import { GuildMember } from "discord.js";
import { serverData } from "../../index";
import { getConfig, updateConfig, createConfig } from "../../util/bot-config";


export async function executeAddUserMenuSpanish(interaction: any, handlerContext: HandlerContext){
    const member : GuildMember = interaction.options.getMember("user") as GuildMember;
    const alias : string = interaction.options.getString("alias") as string;
  
    const serverConfig = serverData.get(interaction.guildId);
  
    handlerContext.userId = member.id;
    if(serverConfig){
      const config = getConfig(interaction.guildId as string);
      serverConfig.aliasUsers[alias.toLowerCase()] = handlerContext.userId;
      config.USERS = serverConfig.aliasUsers
      if(alias.includes('marr')){
        interaction.reply({
          content: 'El alias no puede contener "marrón" o parecido',
          components: [],
          ephemeral: true,
        });
      }else{
        updateConfig(interaction.guildId as string, config);
        interaction.reply({
          content: 'User guardado como ' + alias.toLowerCase(),
          components: [],
          ephemeral: true,
        });
      }
      
    }else{
      createConfig(interaction.guildId)
    }
  }