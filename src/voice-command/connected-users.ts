import { VoiceMessage } from "discord-speech-recognition";
import { GuildMember, PresenceUpdateStatus } from "discord.js";
import { getServerData } from "../util/server-data";
import { speakText } from "../util/tts";

export async function getConnectedUsers(message: VoiceMessage) {
    const connection = getServerData(message.guild.id)?.connection;
    const aliasUsers = getServerData(message.guild.id)?.aliasUsers;

    if(aliasUsers){
        const uniqueKeys = new Set<string>();
        Object.entries(aliasUsers).forEach(([key, value]) => {
          if (!uniqueKeys.has(value)) {
            uniqueKeys.add(value);
          }
        });

        const onlineUsersNames: string[] = [];
        const onlineMember: GuildMember[] = [];
        const guild = message.guild;
        if (!guild) {
          console.log('No se encontró el servidor.');
          return ;
        }

        guild.members.cache.forEach(member => {
          if (uniqueKeys.has(member.id) && 
          (member.presence?.status === PresenceUpdateStatus.Online || member.presence?.status === PresenceUpdateStatus.Idle || member.presence?.status === PresenceUpdateStatus.DoNotDisturb) &&
          !member.voice.channel) {
            onlineUsersNames.push(member.user.username);
            onlineMember.push(member);
          }
        });

        let textOnlineUsers : string = "Estan conectados: ";
        onlineUsersNames.forEach(name =>{
          textOnlineUsers = textOnlineUsers.concat(", " + name);
        })
        speakText(textOnlineUsers, message.guild.id);
    }
    
}