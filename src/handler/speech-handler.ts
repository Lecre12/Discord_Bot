import { VoiceMessage } from "discord-speech-recognition";
import { salute } from "../voice-command/salute";
import { getMessage } from "../lang/lang-manager";
import { LangKeys } from "../lang/lang-keys";
import { getServerData } from "../util/server-data";
import { playSong } from "../util/music";
import { stopAudio } from "../voice-command/stop-audio";
import { kickUser, kickAll } from "../voice-command/kick";


const lastSpeechTimes = new Map<string, number>();
export async function handleSpeech(message: VoiceMessage): Promise<void>{
    if (!message || !message.content) return;

    message.content = message.content!.toLowerCase();

    const now = Date.now();
    const lastTime = lastSpeechTimes.get(message.member!.id) || 0;

    if (now - lastTime > 1500) { 
        lastSpeechTimes.set(message.member!.id, now);
    } else {
        return;
    }
    console.log(message.content);
    const connection = getServerData(message.guild.id)?.connection;
    if(!connection) return;

    if(message.content.startsWith(getMessage(LangKeys.SALUTE_VOICE_COMMAND, message.guild.id))){
        salute(message.guild.id);
        return;
    }else if(message.content.startsWith(getMessage(LangKeys.ACTIVATION_VOICE_COMMAND, message.guild.id) + " " + getMessage(LangKeys.STOP_VOICE_COMMAND, message.guild.id))){
        stopAudio(message.guild.id);
        return;
    } else if(message.content.startsWith(getMessage(LangKeys.ACTIVATION_VOICE_COMMAND, message.guild.id) + " " + getMessage(LangKeys.MUSIC_VOICE_COMMAND, message.guild.id))){
            const song = message.content.slice((getMessage(LangKeys.ACTIVATION_VOICE_COMMAND, message.guild.id) + " " + getMessage(LangKeys.MUSIC_VOICE_COMMAND, message.guild.id)).length).trim();
            console.log("MUSIC TEXT: " + song);
            if(song){    
                if(connection){
                    await playSong(song, message.guild.id);
                } 
            }
    }else if(message.content.startsWith(getMessage(LangKeys.ACTIVATION_VOICE_COMMAND, message.guild.id) + " " + getMessage(LangKeys.KICK_VOICE_COMMAND, message.guild.id))){
        kickUser(message);
    }else if(message.content.startsWith(getMessage(LangKeys.ACTIVATION_VOICE_COMMAND, message.guild.id) + " " + getMessage(LangKeys.NUKE_VOICE_COMMAND, message.guild.id))){
        kickAll(message);
    }
    
}