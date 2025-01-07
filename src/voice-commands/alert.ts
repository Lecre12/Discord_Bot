import { VoiceMessage } from "discord-speech-recognition";
import { getConfig } from "../util/bot-config";
import { GuildMember, VoiceChannel } from "discord.js";
import { legacyAlarmCommand } from "../util/legacyAlarm";

export async function alertUsers(message: VoiceMessage){

    if(!message.member?.voice.channel) return;

    const config = getConfig(message.guild.id)
    if(!config) return;
    const membersCopy: GuildMember[] = Array.from(message.member.voice.channel.members.values()).slice() as GuildMember[];
    membersCopy.forEach((m: GuildMember) => {
        if(m.voice.selfDeaf || m.voice.serverDeaf){
            const targetChannel1 = message.guild?.channels.cache.get(config.CHANNEL1) as VoiceChannel;
            const targetChannel2 = message.guild?.channels.cache.get(config.CHANNEL2) as VoiceChannel;

            legacyAlarmCommand(m, targetChannel1, targetChannel2, message.member?.voice.channel as VoiceChannel);
        }
    });
}