import { VoiceConnection } from "@discordjs/voice";
import { VoiceMessage } from "discord-speech-recognition";
import { GuildMember } from "discord.js";
import { semUpdateStatus, serverData } from "../index";

export async function kickUser(message: VoiceMessage){
    const aliasUsers = serverData.get(message.guild.id)?.aliasUsers;

    if(aliasUsers){
        Object.keys(aliasUsers).forEach((name) => {
          if (message.content?.includes(name)) {
            const userId = aliasUsers[name];
            if(!message.member?.voice.channel) return
            const membersCopy: GuildMember[] = Array.from(message.member.voice.channel.members.values()).slice() as GuildMember[];
            membersCopy.forEach(async (m: GuildMember) => {
              if (m.id == userId && m.voice.channel) {
                await m.voice.disconnect();
              }
            });
          }
        });
      }else{
        console.log("aliasUsers es: " + aliasUsers);
      }
}

export async function kickAll(message: VoiceMessage) {

    await semUpdateStatus.acquire();
    if(!message.member?.voice.channel) return
    const membersCopy: GuildMember[] = Array.from(message.member.voice.channel.members.values()).slice() as GuildMember[];
          membersCopy.forEach(async (m: GuildMember) => {
            if(m.voice){
              console.log(`Expulsado ${m.displayName}`)
              await m.voice.disconnect();
            }
          });
    semUpdateStatus.release();
}