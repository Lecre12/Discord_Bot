import { VoiceMessage } from "discord-speech-recognition";
import { salute } from "../voice-command/salute";
import { getMessage } from "../lang/lang-manager";
import { LangKeys } from "../lang/lang-keys";
import { getServerData } from "../util/server-data";
import { clearSongList, nextSong, playSong } from "../util/music";
import { stopAudio } from "../voice-command/stop-audio";
import { kickUser, kickAll } from "../voice-command/kick";
import { muteUser } from "../voice-command/mute";
import { normalVoiceState } from "../voice-command/unmute-undeaf";
import { deafUser } from "../voice-command/deaf";
import { alertUsers } from "../voice-command/alert";
import { speakText } from "../util/tts";
import { getConnectedUsers } from "../voice-command/connected-users";
import { moveToChannel } from "../voice-command/move";
import { askOpenAi } from "../voice-command/think";
import { russianRoulette, shootRandom } from "../voice-command/gambling";
import { reproduceSound } from "../voice-command/sound";

const lastSpeechTimes = new Map<string, number>();
let lastCommandChipi: number = 0;
const chipiCooldown = 600000;
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
        if(message.member?.id == "567777196048121856"){
            if(now - (lastCommandChipi || 0) > chipiCooldown){
                lastCommandChipi = now;
            }else {
                speakText(`No chipi, no estas castigado`, message.guild.id);
                return;
            }
        }
        kickUser(message);
    }else if(message.content.startsWith(getMessage(LangKeys.ACTIVATION_VOICE_COMMAND, message.guild.id) + " " + getMessage(LangKeys.NUKE_VOICE_COMMAND, message.guild.id))){
        if(message.member?.id == "567777196048121856"){
            if(now - (lastCommandChipi || 0) > chipiCooldown){
                lastCommandChipi = now;
            }else {
                speakText(`No chipi no, estas castigado`, message.guild.id);
                return;
            }
        }
        kickAll(message);
    }else if(message.content.startsWith(getMessage(LangKeys.ACTIVATION_VOICE_COMMAND, message.guild.id) + " " + getMessage(LangKeys.THINK_VOICE_COMMAND, message.guild.id))){
        const textAfterCommand = message.content.slice((getMessage(LangKeys.ACTIVATION_VOICE_COMMAND, message.guild.id) + " " + getMessage(LangKeys.THINK_VOICE_COMMAND, message.guild.id)).length).trim();
        if(message.member?.id == "567777196048121856"){
            if(now - (lastCommandChipi || 0) > chipiCooldown){
                lastCommandChipi = now;
            }else {
                speakText(`No chipi no, estas castigado`, message.guild.id);
                return;
            }
        }
        stopAudio(message.guild.id);
        askOpenAi(textAfterCommand, message.guild.id);
    }else if(message.content.startsWith(getMessage(LangKeys.ACTIVATION_VOICE_COMMAND, message.guild.id) + " " + getMessage(LangKeys.MUTE_VOICE_COMMAND, message.guild.id))){
        if(message.member?.id == "567777196048121856"){
            if(now - (lastCommandChipi || 0) > chipiCooldown){
                lastCommandChipi = now;
            }else {
                speakText(`No chipi no, estas castigado`, message.guild.id);
                return;
            }
        }
        muteUser(message);
    }else if(message.content.startsWith(getMessage(LangKeys.ACTIVATION_VOICE_COMMAND, message.guild.id) + " " + getMessage(LangKeys.SPEAK_VOICE_COMMAND, message.guild.id))){
        if(message.member?.id == "567777196048121856"){
            if(now - (lastCommandChipi || 0) > chipiCooldown){
                lastCommandChipi = now;
            }else {
                speakText(`No chipi no, estas castigado`, message.guild.id);
                return;
            }
        }
        normalVoiceState(message);
    }else if(message.content.startsWith(getMessage(LangKeys.ACTIVATION_VOICE_COMMAND, message.guild.id) + " " + getMessage(LangKeys.DEAF_VOICE_COMMAND, message.guild.id))){
        if(message.member?.id == "567777196048121856"){
            if(now - (lastCommandChipi || 0) > chipiCooldown){
                lastCommandChipi = now;
            }else {
                speakText(`No chipi no, estas castigado`, message.guild.id);
                return;
            }
        }
        deafUser(message);
    }else if(message.content.startsWith(getMessage(LangKeys.ACTIVATION_VOICE_COMMAND, message.guild.id) + " " + getMessage(LangKeys.MOVE_VOICE_COMMAND, message.guild.id)) ||message.content.startsWith(getMessage(LangKeys.ACTIVATION_VOICE_COMMAND, message.guild.id) + " " + getMessage(LangKeys.MOVE_VOICE_COMMANDV2, message.guild.id))){
        if(message.member?.id == "567777196048121856"){
            if(now - (lastCommandChipi || 0) > chipiCooldown){
                lastCommandChipi = now;
            }else {
                speakText(`No chipi no, estas castigado`, message.guild.id);
                return;
            }
        }
        moveToChannel(message);
    }else if(message.content.startsWith(getMessage(LangKeys.ACTIVATION_VOICE_COMMAND, message.guild.id) + " " + getMessage(LangKeys.WHO_VOICE_COMMAND, message.guild.id)) && message.content.includes(getMessage(LangKeys.CONNECTED_VOICE_COMMAND, message.guild.id))){
        if(message.member?.id == "567777196048121856"){
            if(now - (lastCommandChipi || 0) > chipiCooldown){
                lastCommandChipi = now;
            }else {
                speakText(`No chipi no, estas castigado`, message.guild.id);
                return;
            }
        }
        getConnectedUsers(message);
    }else if(message.content.startsWith(getMessage(LangKeys.ACTIVATION_VOICE_COMMAND, message.guild.id) + " " + getMessage(LangKeys.DELETE_SONG_LIST_VOICE_COMMAND, message.guild.id))){
        clearSongList(message.guild.id);
    }else if(message.content.startsWith(getMessage(LangKeys.ACTIVATION_VOICE_COMMAND, message.guild.id) + " " + getMessage(LangKeys.NEXT_SONG_VOICE_COMMAND, message.guild.id))){
        nextSong(message.guild.id);
    }else if(message.content.startsWith(getMessage(LangKeys.ACTIVATION_VOICE_COMMAND, message.guild.id)) && message.content.includes(getMessage(LangKeys.NUMBER_VOICE_COMMAND, message.guild.id)) && message.content.includes(getMessage(LangKeys.RANDOM_VOICE_COMMAND, message.guild.id))){
        stopAudio(message.guild.id);
        speakText(` ${(Math.random() * 10).toFixed()}`, message.guild.id);
    }else if(message.content.startsWith(getMessage(LangKeys.ACTIVATION_VOICE_COMMAND, message.guild.id) + " " + getMessage(LangKeys.ALERT_VOICE_COMMAND, message.guild.id))){
        if(message.member?.id == "567777196048121856"){
            if(now - (lastCommandChipi || 0) > chipiCooldown){
                lastCommandChipi = now;
            }else {
                speakText(`No chipi no, estas castigado`, message.guild.id);
                return;
            }
        }
        alertUsers(message);
    }else if(message.content.startsWith(getMessage(LangKeys.ACTIVATION_VOICE_COMMAND, message.guild.id) + " " + getMessage(LangKeys.RUSSIAN_ROULETTE_VOICE_COMMAND, message.guild.id))){
        if(message.member?.id == "567777196048121856"){
            if(now - (lastCommandChipi || 0) > chipiCooldown){
                lastCommandChipi = now;
            }else {
                speakText(`No chipi no, estas castigado`, message.guild.id);
                return;
            }
        }
        russianRoulette(message);
    }else if(message.content.startsWith(getMessage(LangKeys.ACTIVATION_VOICE_COMMAND, message.guild.id) + " " + getMessage(LangKeys.SHOOT_RANDOM_VOICE_COMMAND, message.guild.id))){
        if(message.member?.id == "567777196048121856"){
            if(now - (lastCommandChipi || 0) > chipiCooldown){
                lastCommandChipi = now;
            }else {
                speakText(`No chipi no, estas castigado`, message.guild.id);
                return;
            }
        }
        shootRandom(message);
    }else if(message.content.startsWith(getMessage(LangKeys.ACTIVATION_VOICE_COMMAND, message.guild.id) + " " + getMessage(LangKeys.SOUND_VOICE_COMMAND, message.guild.id))){
        if(message.member?.id == "567777196048121856"){
            if(now - (lastCommandChipi || 0) > chipiCooldown){
                lastCommandChipi = now;
            }else {
                speakText(`No chipi no, estas castigado`, message.guild.id);
                return;
            }
        }
        reproduceSound(message);
    }
    
}