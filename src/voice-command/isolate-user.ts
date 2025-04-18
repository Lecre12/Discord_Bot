import { GuildMember, VoiceChannel } from 'discord.js';

export async function isolateMemberFromChannel(member: GuildMember, channel: VoiceChannel): Promise<void> {
  try {
    // Revocar el permiso de conexión para que el miembro no pueda unirse
    await channel.permissionOverwrites.edit(member, {
      Connect: false
    });
    console.log(`${member.user.tag} ha sido aislado del canal ${channel.name}.`);
  } catch (error) {
    console.error("Error al aislar al miembro:", error);
  }
}

export async function restoreMemberAccessToChannel(member: GuildMember, channel: VoiceChannel): Promise<void> {
  try {
    // Restaurar el permiso de conexión para que el miembro pueda unirse nuevamente
    await channel.permissionOverwrites.edit(member, {
      Connect: true
    });
    console.log(`${member.user.tag} ha recuperado el acceso al canal ${channel.name}.`);
  } catch (error) {
    console.error("Error al restaurar el acceso del miembro:", error);
  }
}
