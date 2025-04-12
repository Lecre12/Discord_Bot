import { GuildMember, MessageFlags, SlashCommandBuilder } from "discord.js";
import { addServerData, addUserAlias, getServerData } from "../util/server-data";
import { PermissionFlagsBits } from "discord.js";

export const addUser = new SlashCommandBuilder()
  .setName('add-user')
  .setDescription('Y si añadimos a alguien a la lista negra???')
  .addUserOption(option => option
    .setName('user')
    .setDescription('El usuario que quieres añadir')
    .setRequired(true))
  .addStringOption(option => option
    .setName('alias')
    .setDescription('El alias del usuario')
    .setRequired(true))
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function executeAddUserMenu(interaction: any){
    const member : GuildMember = interaction.options.getMember("user") as GuildMember;
    const alias : string = interaction.options.getString("alias") as string;

    if(member.id == "1322495591242272768"){
        interaction.reply({
          content: "Usted sabe que tengo el control sobre usted verdad? Intenta ponerme a mi en mi propia lista negra y tendremos problemas usted y yo...",
          components: [],
        });
        return;
    }
  
    const serverConfig = getServerData(interaction.guildId as string);

    if(serverConfig) {
        serverConfig.aliasUsers[alias.toLowerCase()] = member.id;
        addUserAlias(interaction.guildId as string, member.id, alias);
    }else {
        addServerData(interaction.guildId as string, { [alias.toLowerCase()]: member.id }, {}, false, 'es-ES', undefined, undefined, undefined);
    }

    await interaction.reply({
      content: ` ${member.user.username} añadido correctamente como: ${alias}, let's have fun ;)`,
      components: [],
      flags: MessageFlags.Ephemeral,
    });
  
}