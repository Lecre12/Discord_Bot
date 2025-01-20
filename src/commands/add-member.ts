import { GuildMember, MessageFlags } from "discord.js";
import { serverData } from "..";
import { getConfig, updateConfig, createConfig } from "../util/bot-config";
import { getMessage } from "../lang/lang-manager";
import { LangKeys } from "../lang/lang-keys";


export async function executeAddUserMenu(interaction: any, handlerContext: HandlerContext){
    const member : GuildMember = interaction.options.getMember("user") as GuildMember;
    const alias : string = interaction.options.getString("alias") as string;
    const bannedAlias = ["brow", "marrón", "marr", "brown"];
  
    const serverConfig = serverData.get(interaction.guildId);
  
    handlerContext.userId = member.id;
    if(serverConfig){
      const config = getConfig(interaction.guildId as string);
      serverConfig.aliasUsers[alias.toLowerCase()] = member.id;
      config.USERS = serverConfig.aliasUsers;
      let banned = false;
      for (const banAlias of bannedAlias) {
        if (alias.includes(banAlias)) {
            banned = true;
            break;
        }
    }
      
      if(alias.includes(getMessage(LangKeys.BROWN_NAME, interaction.guildId)) || banned){
        interaction.reply({
          content: getMessage(LangKeys.ERR_BOT_NAME_ON_ALIAS, interaction.guildId),
          components: [],
          flags: MessageFlags.Ephemeral,
        });
      }else{
        updateConfig(interaction.guildId as string, config);
        interaction.reply({
          content: getMessage(LangKeys.CONFIRMATION_USER_SAVED, interaction.guildId) + alias.toLowerCase(),
          components: [],
          flags: MessageFlags.Ephemeral,
        });
      }
      
    }else{
      createConfig(interaction.guildId)
    }
  }