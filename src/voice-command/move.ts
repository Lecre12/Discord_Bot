import { VoiceMessage } from "discord-speech-recognition";
import { GuildMember, GuildVoiceChannelResolvable } from "discord.js";
import { getServerData } from "../util/server-data";

export async function moveToChannel(message: VoiceMessage) {
    const moveChannels = getServerData(message.guild.id)?.moveChannels;
    if(moveChannels) {
        // Buscar si el mensaje contiene algún nombre de canal configurado
        const channelEntry = Object.entries(moveChannels).find(([_, name]) => 
            message.content?.includes(name)
        );

        if (channelEntry) {
            const [channelId, channelName] = channelEntry;
            console.log("Moviendo a channel id: ", channelId);
            const targetChannel = message.guild?.channels.cache.get(channelId) as GuildVoiceChannelResolvable;
            
            if(!message.member?.voice.channel) return;
            
            const membersCopy: GuildMember[] = Array.from(message.member.voice.channel.members.values()).slice() as GuildMember[];
            
            membersCopy.forEach(async (m: GuildMember) => {
                try {
                    if(message.member?.voice.channel) {
                        await m.voice.setChannel(targetChannel);
                    }
                } catch(error) {
                    console.error(`Error al mover miembro ${m.displayName}:`, error);
                }
            });
        }
    }
}