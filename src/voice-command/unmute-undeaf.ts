import { VoiceMessage } from 'discord-speech-recognition';
import { GuildMember } from 'discord.js';
export async function normalVoiceState(message: VoiceMessage) {
    if(!message.member?.voice.channel) return;
    const membersCopy: GuildMember[] = Array.from(message.member?.voice.channel.members.values()).slice() as GuildMember[];
    membersCopy.forEach((m: any) => {
        m.voice.setMute(false);
        m.voice.setDeaf(false);
    });
}