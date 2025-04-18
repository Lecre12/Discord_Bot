import { VoiceMessage } from "discord-speech-recognition";
import { GuildMember } from "discord.js";
import { getServerData } from "../util/server-data";

export async function muteUser(message: VoiceMessage) {
    const aliasUsers = getServerData(message.guild.id)?.aliasUsers;

    if(aliasUsers)
    Object.keys(aliasUsers).forEach((name) => {
        if (message.content?.includes(name)) {
            const userId = aliasUsers[name];
            if(!message.member?.voice.channel) return
            const membersCopy: GuildMember[] = Array.from(message.member?.voice.channel.members.values()).slice() as GuildMember[];
            membersCopy.forEach((m: any) => {
            if (m.id == userId) {
                m.voice.setMute(true);
            }
            });
        }
    });
}

export function muteUserByGuildMember(member: GuildMember) {
    if (member.voice.channel) {
        member.voice.setMute(true);
    }
}