import { VoiceConnection } from '@discordjs/voice';
import { VoiceMessage } from "discord-speech-recognition";
import { client, serverData } from "../index";
import { GuildMember, PresenceUpdateStatus } from "discord.js";
import { speakText } from '../util/ttsUtil';

export async function getConnectedUsers(message: VoiceMessage, connection: VoiceConnection) {
    const aliasUsers = serverData.get(message.guild.id)?.aliasUsers;

    if(aliasUsers){
        const uniqueKeys = new Set<string>();
        Object.entries(aliasUsers).forEach(([key, value]) => {
          if (!uniqueKeys.has(value) && key != 'chip') {
            uniqueKeys.add(value);
            //console.log(`Procesando clave única: ${key} con valor: ${value}`);
            // Realizar aquí las acciones que necesites para claves únicas
          }
        });

        const onlineUsersNames: string[] = [];
        const onlineMember: GuildMember[] = [];
        const guild = await client.guilds.fetch('736543433581133856');
        if (!guild) {
          console.log('No se encontró el servidor.');
          return ;
        }

        guild.members.cache.forEach(member => {
          //console.log(member.displayName)
          // Verificar si el miembro está en uniqueKeys y si está en línea
          if (uniqueKeys.has(member.id) && 
          (member.presence?.status === PresenceUpdateStatus.Online || member.presence?.status === PresenceUpdateStatus.Idle || member.presence?.status === PresenceUpdateStatus.DoNotDisturb) &&
          !member.voice.channel) {
            onlineUsersNames.push(member.user.username);
            onlineMember.push(member);
          }
        });

        let textOnlineUsers : string = "Estan conectados: ";
        //console.log(onlineUsers);
        onlineUsersNames.forEach(name =>{
          textOnlineUsers = textOnlineUsers.concat(", " + name);
        })
        speakText(textOnlineUsers, connection);
    }
    
}