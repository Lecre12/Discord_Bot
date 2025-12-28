import { VoiceMessage } from "../type/voice-message";
import { LangKeys } from "../lang/lang-keys";
import { getMessage } from "../lang/lang-manager";
import { playAudio } from "../util/play-audio";
import path from "path";
import fs from "fs";

export function reproduceSound(message: VoiceMessage, sonido?: string) {
    let soundToSearch = sonido || message.content?.slice((getMessage(LangKeys.ACTIVATION_VOICE_COMMAND, message.guild.id) + " " + getMessage(LangKeys.SOUND_VOICE_COMMAND, message.guild.id)).length).trim();

    console.log(soundToSearch);

    const customAudioPath = path.resolve(
        __dirname, 
        `../../static-audio/${soundToSearch}-${message.guild.id}.mp3`
    );

    if (!fs.existsSync(customAudioPath)) {
        console.log(`Audio file not found: ${customAudioPath}`);
        return;
    }

    playAudio(customAudioPath, message.guild.id);
}