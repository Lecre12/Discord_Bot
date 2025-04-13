import { GuildMember, MessageFlags, SlashCommandBuilder } from "discord.js";
import { removeUserAlias, getServerData } from "../util/server-data";
import { PermissionFlagsBits } from "discord.js";
import { getMessage } from "../lang/lang-manager";
import { LangKeys } from "../lang/lang-keys";

export const removeUserAliasCommand = new SlashCommandBuilder()
  .setName('remove-user-alias')
  .setDescription('Usuario a eliminar de la lista negra :(')
  .addUserOption(option => option
    .setName('user')
    .setDescription('El usuario que quieres eliminar')
    .setRequired(true))
  .addStringOption(option => option
    .setName('alias')
    .setDescription('El alias del usuario')
    .setRequired(false))
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function executeRemoveUserAlias(interaction: any){
    const member : GuildMember = interaction.options.getMember("user") as GuildMember;
    const alias : string = interaction.options.getString("alias") as string || "";
  
    const serverConfig = getServerData(interaction.guildId as string);

    if(serverConfig) {
        removeUserAlias(interaction.guildId as string, member.id, alias);
    }

    await interaction.reply({
      content:  getMessage(LangKeys.CONFIRMATION_USER_REMOVED, interaction.guildId as string) + `let's have fun ;)`,
      components: [],
      flags: MessageFlags.Ephemeral,
    });
  
}