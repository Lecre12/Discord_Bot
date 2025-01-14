import { VoiceMessage } from "discord-speech-recognition";
import { client, serverData } from "../index";
import { GuildMember, GuildVoiceChannelResolvable } from "discord.js";

export async function moveToChannel(message: VoiceMessage) {
    const moveChannels = serverData.get(message.guild.id)?.moveChannels;
    if(moveChannels)
        Object.keys(moveChannels).forEach((name) => {
        if (message.content?.includes(name)) {
            const channelId = moveChannels[name];
            console.log(channelId)
            const targetChannel = message.guild?.channels.cache.get(channelId) as GuildVoiceChannelResolvable;
            if(!message.member?.voice.channel) return;
            const membersCopy: GuildMember[] = Array.from(message.member?.voice.channel.members.values()).slice() as GuildMember[];
            membersCopy.forEach(async (m: GuildMember) => {
            try{
                if(message.member?.voice.channel && m.id != client.user?.id){
                    await m.voice.setChannel(targetChannel);
                }
                
            }catch(error){
                console.error(`Error al mover miembro ${m.displayName}:`, error);
            }
            });
        }
        });
}