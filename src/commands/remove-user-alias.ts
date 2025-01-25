import { GuildMember, MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { serverData } from '..';
import { createConfig, getConfig, updateConfig } from '../util/bot-config';
import { getMessage } from '../lang/lang-manager';
import { LangKeys } from '../lang/lang-keys';

export const removeUserAlias = new SlashCommandBuilder()
  .setName('remove-user-alias')
  .setDescription('Removes an user alias')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addStringOption((option) =>
    option.setName("alias").setDescription("Alias of the user").setRequired(false))
  .addUserOption((option) => 
    option.setName("user").setDescription("The user in general, to delete all alias related to it").setRequired(false));

export async function executeRemoveUserAlias(interaction: any) {

  const member : GuildMember = interaction.options.getMember("user") as GuildMember;
  const alias : string = interaction.options.getString("alias") as string;
  const serverConfig = serverData.get(interaction.guildId);

  if(!serverConfig){
    createConfig(interaction.guildId);
    return;
  }

  const config = getConfig(interaction.guildId as string);
  
  if(member){
    //Eliminar todos los alias de un user especifico
    Object.entries(serverConfig.aliasUsers).forEach(([aliasKey, aliasValue]) => {
      if(serverConfig.aliasUsers[aliasKey] == member.id){
        delete serverConfig.aliasUsers[aliasKey];
      }
    });
    config.USERS = serverConfig.aliasUsers;
    updateConfig(interaction.guildId as string, config);
    await interaction.reply({
      content: getMessage(LangKeys.CONFIRMATION_USER_DELETED, interaction.guildId),
      components: [],
      flags: MessageFlags.Ephemeral,
    });
  }else if(alias){
    //Eliminar el alias especificado
    if(serverConfig.aliasUsers[alias.toLowerCase()]){
      delete serverConfig.aliasUsers[alias.toLowerCase()];
      config.USERS = serverConfig.aliasUsers;
      updateConfig(interaction.guildId as string, config);
      await interaction.reply({
        content: getMessage(LangKeys.CONFIRMATION_USER_DELETED, interaction.guildId),
        components: [],
        flags: MessageFlags.Ephemeral,
      });
    }else{
      await interaction.reply({
        content: getMessage(LangKeys.ERR_ALIAS_NOT_FOUND, interaction.guildId),
        components: [],
        flags: MessageFlags.Ephemeral,
      });
    }
  }else{
    //Eliminar todos los usuarios de la base de datos
    serverConfig.aliasUsers = {};
    config.USERS = serverConfig.aliasUsers;
    updateConfig(interaction.guildId as string, config);
    await interaction.reply({
      content: getMessage(LangKeys.CONFIRMATION_USER_DELETED, interaction.guildId),
      components: [],
      flags: MessageFlags.Ephemeral,
    });
  }

  //await interaction.reply({ content: 'Not implemmented yet.', flags: MessageFlags.Ephemeral,});
}