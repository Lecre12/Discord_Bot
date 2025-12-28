import { VoiceMessage } from "../type/voice-message";
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
import { handleJudgment, initJudgment } from "../voice-command/judgment";
import { globalInsult, insultUser } from "../voice-command/insult";
import { GuildMember } from "discord.js";
import { clasificateSpeech } from "../util/open-ia";

// TODO: HAcer un refactor completo de la parte de speech-handler a que sea un mcp y demass

const lastSpeechTimes = new Map<string, number>();
let lastCommandChipi: number = 0;
const chipiCooldown = 600000;
const stateJudging = new Map<string, boolean>();
/** 
 * @deprecated Usa `handleSpeechAi` en su lugar.
 */
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

    if(stateJudging.get(message.guild.id)){
        handleJudgment(message);
        return;
    }else{
        stateJudging.set(message.guild.id, false);
    }
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
    }else if(message.content.startsWith(getMessage(LangKeys.ACTIVATION_VOICE_COMMAND, message.guild.id) + " " + getMessage(LangKeys.JUDGMENT_VOICE_COMMAND, message.guild.id))){
        console.log("JUDGMENT");
        if(initJudgment(message, stateJudging)){
            speakText("¡Juez, acusador, acusado, comienza el juicio!", message.guild.id);
            stateJudging.set(message.guild.id, true);
        }
    }else if(message.content.startsWith(getMessage(LangKeys.ACTIVATION_VOICE_COMMAND, message.guild.id) + " " + getMessage(LangKeys.INSULT_VOICE_COMMAND, message.guild.id))){
        const aliasUsers = getServerData(message.guild.id)?.aliasUsers;
        let userToInsult: GuildMember | undefined;
        if(aliasUsers){
            Object.keys(aliasUsers).forEach((name) => {
                if (message.content?.includes(name)) {
                const userId = aliasUsers[name];
                if(!message.member?.voice.channel) return
                const membersCopy: GuildMember[] = Array.from(message.guild.members.cache.values()).slice() as GuildMember[];
                membersCopy.forEach(async (m: GuildMember) => {
                    if (m.id == userId) {
                        userToInsult = m;
                    }
                });
                }
            });
        }else{
            console.log("aliasUsers es: " + aliasUsers);
        }
        if(userToInsult){
            insultUser(userToInsult, message.guild.id);
        }else{
            globalInsult(message.guild.id);
        }
    }
}

function controlChipiPunishment(message: VoiceMessage): boolean {
    const now = Date.now();
    if(message.member?.id == "567777196048121856"){
        if(now - (lastCommandChipi || 0) > chipiCooldown){
            lastCommandChipi = now;
            return true;
        }else {
            speakText(`No chipi no, estas castigado`, message.guild.id);
            return false;
        }
    }else{
        return true;
    }
}

export async function handleSpeechAi(message: VoiceMessage): Promise<void>{
    if (!message || !message.content) return;
    message.content = message.content!.toLowerCase();

    const now = Date.now();
    const lastTime = lastSpeechTimes.get(message.member!.id) || 0;

    if (now - lastTime > 3000) { 
        lastSpeechTimes.set(message.member!.id, now);
    } else {
        return;
    }

    const connection = getServerData(message.guild.id)?.connection;
    if(!connection) return;

    if(stateJudging.get(message.guild.id)){
        handleJudgment(message);
        return;
    }else{
        stateJudging.set(message.guild.id, false);
    }

    const messageContent = message.content;

    if(message.content.startsWith(getMessage(LangKeys.SALUTE_VOICE_COMMAND, message.guild.id))){
        salute(message.guild.id);
        return;
    }

    if(!messageContent.includes
        (getMessage(LangKeys.ACTIVATION_VOICE_COMMAND, message.guild.id))
    ){
        return;
    }
    const realMessageContent = messageContent.startsWith(getMessage(LangKeys.ACTIVATION_VOICE_COMMAND, message.guild.id)) ? messageContent.slice((getMessage(LangKeys.ACTIVATION_VOICE_COMMAND, message.guild.id)).length).trim() : messageContent;

    if(realMessageContent.length === 0) return;
    if(!controlChipiPunishment(message)) return;

    console.log("Real message content: " + realMessageContent);
    const classification = await clasificateSpeech(realMessageContent)

    switch (classification.option) {
        case "saludar":
            salute(message.guild.id);
            break;
        case "parar":
            stopAudio(message.guild.id);
            break;
        case "callar":
            stopAudio(message.guild.id);
            break;
        case "ruleta_rusa":
            russianRoulette(message);
            break;
        case "disparar_aleatorio":
            shootRandom(message);
            break;
        case "insultar":
            const aliasUsers = getServerData(message.guild.id)?.aliasUsers;
            let userToInsult: GuildMember | undefined;
            if(aliasUsers){
                Object.keys(aliasUsers).forEach((name) => {
                    if (message.content?.includes(name)) {
                    const userId = aliasUsers[name];
                    if(!message.member?.voice.channel) return
                    const membersCopy: GuildMember[] = Array.from(message.guild.members.cache.values()).slice() as GuildMember[];
                    membersCopy.forEach(async (m: GuildMember) => {
                        if (m.id == userId) {
                            userToInsult = m;
                        }
                    });
                    }
                });
            }else{
                console.log("aliasUsers es: " + aliasUsers);
            }
            if(userToInsult){
                insultUser(userToInsult, message.guild.id);
            }else{
                globalInsult(message.guild.id);
            }
            break;
        case "juicio":
            console.log("JUDGMENT");
        
            if(initJudgment(message, stateJudging)){
                speakText("¡Juez, acusador, acusado, comienza el juicio!", message.guild.id);
                stateJudging.set(message.guild.id, true);
            }
            break;
        case "desilenciar_desensordecer":
            normalVoiceState(message);
            break;
        case "silenciar":
            muteUser(message);
            break;
        case "ensordecer":
            deafUser(message);
            break;
        case "mover_de_canales":
            moveToChannel(message);
            break;
        case "quien_esta_conectado":
            getConnectedUsers(message);
            break;
        case "alerta":
            alertUsers(message);
            break;
        case "expulsar_usuario":
            kickUser(message);
            break;
        case "nuke":
            kickAll(message);
            break;
        case "expulsar_todos":
            kickAll(message);
            break;
        case "poner_cancion":
            const song = message.content.slice((getMessage(LangKeys.ACTIVATION_VOICE_COMMAND, message.guild.id) + " " + getMessage(LangKeys.MUSIC_VOICE_COMMAND, message.guild.id)).length).trim();
            console.log("MUSIC TEXT: " + song);
            if(song){    
                if(connection){
                    await playSong(song, message.guild.id);
                } 
            }
            break;
        case "limpiar_lista_canciones":
            clearSongList(message.guild.id);
            break;
        case "siguiente_cancion":
            nextSong(message.guild.id);
            break;
        case "opinar":
        case "aconsejar":
        case "pensar":
            let textAfterCommand = message.content.slice((getMessage(LangKeys.ACTIVATION_VOICE_COMMAND, message.guild.id) + " " + getMessage(LangKeys.THINK_VOICE_COMMAND, message.guild.id)).length).trim();
            if(textAfterCommand.length === 0 && realMessageContent.length > 0){
                textAfterCommand = realMessageContent;
            }
            stopAudio(message.guild.id);
            askOpenAi(textAfterCommand, message.guild.id);
            break;
        case "poner_sonido_especifico":
            reproduceSound(message, classification.sound);
            break;
        case "alerta":
            alertUsers(message);
            break;
        case "numero_aleatorio":
            stopAudio(message.guild.id);
            speakText(` ${(Math.random() * 10).toFixed()}`, message.guild.id);
            break;
        case "none":
            console.log("Comando no reconocido.");
            break;
        default:
            console.log("Comando no implementado o no reconocido.");
            break;
    }
        



}