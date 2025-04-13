import { VoiceMessage } from "discord-speech-recognition";
import { LangKeys } from "../lang/lang-keys";
import { getMessage } from "../lang/lang-manager";
import { playAudio } from "../util/play-audio";
import path from "path";

export function reproduceSound(message: VoiceMessage){
    const soundToSearch = message.content?.slice((getMessage(LangKeys.ACTIVATION_VOICE_COMMAND, message.guild.id) + " " + getMessage(LangKeys.SOUND_VOICE_COMMAND, message.guild.id)).length).trim();

    console.log(soundToSearch);

    const customAudioPath = path.resolve(
        __dirname, 
        `../../static-audio/${soundToSearch}-${message.guild.id}.mp3`
    );

    playAudio(customAudioPath, message.guild.id);
}