import { VoiceMessage } from "discord-speech-recognition";
import { serverData } from "../index";
import { GuildMember } from "discord.js";

export async function moveToChannel(message: VoiceMessage) {
    const moveChannels = serverData.get(message.guild.id)?.moveChannels;
    if(moveChannels)
        Object.keys(moveChannels).forEach((name) => {
        if (message.content?.includes(name)) {
            const channelId = moveChannels[name];
            console.log(channelId)
            const targetChannel = message.guild?.channels.cache.get(channelId);
            if(!message.member?.voice.channel) return;
            const membersCopy: GuildMember[] = Array.from(message.member?.voice.channel.members.values()).slice() as GuildMember[];
            membersCopy.forEach(async (m: any) => {
            try{
                await m.voice.setChannel(targetChannel);
            }catch(error){}
            });
        }
        });
}