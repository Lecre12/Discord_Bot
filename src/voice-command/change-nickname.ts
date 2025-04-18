import { Guild } from "discord.js";

async function changeNickname(
    guild: Guild,
    userId: string,
    newNickname: string
  ): Promise<void> {
    try {
      const member = await guild.members.fetch(userId);
      
      await member.setNickname(newNickname);
      console.log(`El apodo de ${member.user.tag} ha sido cambiado a: ${newNickname}`);
    } catch (error) {
      console.error("Error al cambiar el apodo:", error);
    }
  }
  
  export { changeNickname };