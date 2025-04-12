import { VoiceMessage } from "discord-speech-recognition";
import { GuildMember, VoiceChannel } from "discord.js";
import { legacyAlarmCommand } from "../util/legacyAlarm";
import { getServerData } from "../util/server-data";
import { speakText } from "../util/tts";

export async function alertUsers(message: VoiceMessage){

    if(!message.member?.voice.channel) return;

    const membersCopy: GuildMember[] = Array.from(message.member?.voice.channel.members.values()).slice() as GuildMember[];
    const serverData = getServerData(message.guild.id);
    if(serverData){
        if(Object.keys(serverData?.moveChannels).length >= 2){
            const targetChannel1 = message.guild?.channels.cache.get(Array.from(Object.keys(serverData?.moveChannels).values())[0]) as VoiceChannel;
            const targetChannel2 = message.guild?.channels.cache.get(Array.from(Object.keys(serverData?.moveChannels).values())[1]) as VoiceChannel;

            membersCopy.forEach((m: GuildMember) => {
                if(m.voice.selfDeaf || m.voice.serverDeaf){
                    legacyAlarmCommand(m, targetChannel1, targetChannel2, message.member?.voice.channel as VoiceChannel);
                }
            });
        }
    }else {
        speakText("Revisa la configuracion, no puedo efectuar este comando", message.guild.id);
    }
}