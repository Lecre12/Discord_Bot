import { VoiceMessage } from "discord-speech-recognition";
import { GuildMember } from "discord.js";
import { client, serverData } from "../index";

export async function deafUser(message: VoiceMessage) {
    const aliasUsers = serverData.get(message.guild.id)?.aliasUsers;
    
        if(aliasUsers)
        Object.keys(aliasUsers).forEach((name) => {
            if (message.content?.includes(name)) {
                const userId = aliasUsers[name];
                if(!message.member?.voice.channel) return
                const membersCopy: GuildMember[] = Array.from(message.member?.voice.channel.members.values()).slice() as GuildMember[];
                membersCopy.forEach((m: any) => {
                if (m.id == userId && m.id != client.user?.id) {
                    m.voice.setDeaf(true);
                }
                });
            }
        });
}

export async function deafAll(message: VoiceMessage) {
    
}