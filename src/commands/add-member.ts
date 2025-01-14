import { GuildMember } from "discord.js";
import { serverData } from "..";
import { getConfig, updateConfig, createConfig } from "../util/bot-config";
import { getMessage } from "../lang/lang-manager";
import { LangKeys } from "../lang/lang-keys";


export async function executeAddUserMenu(interaction: any, handlerContext: HandlerContext){
    const member : GuildMember = interaction.options.getMember("user") as GuildMember;
    const alias : string = interaction.options.getString("alias") as string;
  
    const serverConfig = serverData.get(interaction.guildId);
  
    handlerContext.userId = member.id;
    if(serverConfig){
      const config = getConfig(interaction.guildId as string);
      serverConfig.aliasUsers[alias.toLowerCase()] = handlerContext.userId;
      config.USERS = serverConfig.aliasUsers
      if(alias.includes(getMessage(LangKeys.BROWN_NAME, interaction.guildId))){
        interaction.reply({
          content: getMessage(LangKeys.ERR_BOT_NAME_ON_ALIAS, interaction.guildId),
          components: [],
          ephemeral: true,
        });
      }else{
        updateConfig(interaction.guildId as string, config);
        interaction.reply({
          content: getMessage(LangKeys.CONFIRMATION_USER_SAVED, interaction.guildId) + alias.toLowerCase(),
          components: [],
          ephemeral: true,
        });
      }
      
    }else{
      createConfig(interaction.guildId)
    }
  }