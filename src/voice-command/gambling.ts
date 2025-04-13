import { VoiceMessage } from "discord-speech-recognition";
import { getServerData } from "../util/server-data";
import { GuildMember } from "discord.js";
import { playAudio } from "../util/play-audio";
import path from "path";
import { wait } from "../util/wait";

export async function russianRoulette(message: VoiceMessage) {
    if(!message.member?.voice.channel) return

    const randomNumberToGet = (Math.random() * 6).toFixed()

    playAudio(path.resolve(__dirname, "../../static-audio/chamber_spin.mp3"), message.guild.id);
    await wait(1200);

    const membersCopy: GuildMember[] = Array.from(message.member.voice.channel.members.values()).slice() as GuildMember[];
        membersCopy.forEach(async (m: GuildMember) => {
            const randomNumberUser = (Math.random() * 6).toFixed();
            if(m.voice && randomNumberToGet === randomNumberUser){
                console.log(`Expulsado ${m.displayName}`);
                playAudio(path.resolve(__dirname, "../../static-audio/shot.mp3"), message.guild.id);
                await wait(1000);
                await m.voice.disconnect();
            }
        });
}

export async function shootRandom(message: VoiceMessage){
    const membersCopy: GuildMember[] = Array.from(message.member?.voice.channel?.members.values() || []).slice() as GuildMember[];
    const numberOfUsersInChat = membersCopy.length;

    let done = false;
        const randomNumberToGet = Math.floor(Math.random() * numberOfUsersInChat);
        
    if(membersCopy[randomNumberToGet] && membersCopy[randomNumberToGet].voice && membersCopy[randomNumberToGet].id != "1322495591242272768"){
        console.log(`Expulsado ${membersCopy[randomNumberToGet].displayName}`);
        playAudio(path.resolve(__dirname, "../../static-audio/shot.mp3"), message.guild.id);
        await wait(1000);
        await membersCopy[randomNumberToGet].voice.disconnect();
        done = true;
    }else if(membersCopy[0] && membersCopy[0].voice) {
        console.log(`Expulsado ${membersCopy[0].displayName}`);
        playAudio(path.resolve(__dirname, "../../static-audio/shot.mp3"), message.guild.id);
        await wait(1000);
        await membersCopy[0].voice.disconnect();
        done = true;
    }
}