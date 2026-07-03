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
import { handleJudgment, initJudgment } from "../voice-command/judgment";
import { globalInsult, insultUser } from "../voice-command/insult";
import { GuildMember } from "discord.js";
import { clasificateSpeech } from "../util/open-ia";
import { debugLog } from "../util/debug-log";
import { classifySpeechLocally } from "../util/local-speech-classifier";

// TODO: HAcer un refactor completo de la parte de speech-handler a que sea un mcp y demass

const lastSpeechTimes = new Map<string, number>();
let lastCommandChipi: number = 0;
const chipiCooldown = 600000;
const stateJudging = new Map<string, boolean>();
const guildSpeechQueues = new Map<string, Promise<void>>();
const guildQueueSizes = new Map<string, number>();
const lastGuildCommandTimes = new Map<string, number>();
const MAX_PENDING_SPEECH_PER_GUILD = 5;
const USER_SPEECH_COOLDOWN_MS = 3000;
const GUILD_COMMAND_COOLDOWN_MS = 650;
const MIN_CLASSIFICATION_CONFIDENCE = 0.45;

function getSpeakerLabel(message: VoiceMessage): string {
    return message.author?.tag ?? message.author?.id ?? message.member?.id ?? "desconocido";
}

function normalizeSpeech(text: string): string {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\p{L}\p{N}\s]/gu, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function getVoiceText(key: LangKeys, guildId: string): string {
    return normalizeSpeech(getMessage(key, guildId));
}

function isInBotVoiceChannel(message: VoiceMessage): boolean {
    const connection = getServerData(message.guild.id)?.connection;
    const botChannelId = connection?.joinConfig.channelId;
    const memberChannelId = message.member?.voice.channelId;

    return Boolean(botChannelId && memberChannelId && botChannelId === memberChannelId);
}

function hasSpanishWakeWord(message: VoiceMessage): boolean {
    const content = normalizeSpeech(message.content ?? "");
    return content.startsWith(getVoiceText(LangKeys.SALUTE_VOICE_COMMAND, message.guild.id))
        || content.includes(getVoiceText(LangKeys.ACTIVATION_VOICE_COMMAND, message.guild.id));
}

export async function enqueueSpeechMessage(message: VoiceMessage): Promise<void> {
    if (!message?.content) return;

    const speaker = getSpeakerLabel(message);
    if (!message.member) {
        debugLog(`[Speech][Filter] Sin miembro guild=${message.guild.id} user=${speaker} text="${message.content}"`);
        return;
    }

    if (message.member.user.bot) {
        debugLog(`[Speech][Filter] Ignoro bot guild=${message.guild.id} user=${speaker}`);
        return;
    }

    if (!isInBotVoiceChannel(message)) {
        const botChannelId = getServerData(message.guild.id)?.connection?.joinConfig.channelId ?? "sin-conexion";
        const memberChannelId = message.member.voice.channelId ?? "sin-canal";
        debugLog(`[Speech][Filter] Fuera del canal del bot guild=${message.guild.id} user=${speaker} botChannel=${botChannelId} userChannel=${memberChannelId} text="${message.content}"`);
        return;
    }

    if (!hasSpanishWakeWord(message)) {
        debugLog(`[Speech][Filter] Sin palabra de activacion guild=${message.guild.id} user=${speaker} text="${message.content}"`);
        return;
    }

    const guildId = message.guild.id;
    const pending = guildQueueSizes.get(guildId) ?? 0;
    if (pending >= MAX_PENDING_SPEECH_PER_GUILD) {
        debugLog(`[Speech][Queue] Descarto audio guild=${guildId} user=${speaker}: cola llena (${pending}).`);
        return;
    }

    debugLog(`[Speech][Queue] Encolo guild=${guildId} user=${speaker} pending=${pending + 1} text="${message.content}"`);
    guildQueueSizes.set(guildId, pending + 1);
    const previous = guildSpeechQueues.get(guildId) ?? Promise.resolve();
    const next = previous
        .catch(() => undefined)
        .then(() => handleSpeechAi(message))
        .finally(() => {
            guildQueueSizes.set(guildId, Math.max((guildQueueSizes.get(guildId) ?? 1) - 1, 0));
            if (guildSpeechQueues.get(guildId) === next) {
                guildSpeechQueues.delete(guildId);
            }
        });

    guildSpeechQueues.set(guildId, next);
    await next;
}
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
    debugLog(message.content);
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
            debugLog("MUSIC TEXT: " + song);
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
        debugLog("JUDGMENT");
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
            debugLog("aliasUsers es: " + aliasUsers);
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
    const originalContent = message.content;
    message.content = normalizeSpeech(message.content);
    const speaker = getSpeakerLabel(message);
    debugLog(`[Speech][Process] Normalizado guild=${message.guild.id} user=${speaker} raw="${originalContent}" normalized="${message.content}"`);

    const now = Date.now();
    const lastTime = lastSpeechTimes.get(message.member!.id) || 0;

    if (now - lastTime > USER_SPEECH_COOLDOWN_MS) { 
        lastSpeechTimes.set(message.member!.id, now);
    } else {
        debugLog(`[Speech][Filter] Cooldown usuario guild=${message.guild.id} user=${speaker} remainingMs=${USER_SPEECH_COOLDOWN_MS - (now - lastTime)}`);
        return;
    }

    const lastGuildCommandTime = lastGuildCommandTimes.get(message.guild.id) ?? 0;
    if (now - lastGuildCommandTime < GUILD_COMMAND_COOLDOWN_MS) {
        debugLog(`[Speech][Filter] Cooldown servidor guild=${message.guild.id} remainingMs=${GUILD_COMMAND_COOLDOWN_MS - (now - lastGuildCommandTime)}`);
        return;
    }
    lastGuildCommandTimes.set(message.guild.id, now);

    const connection = getServerData(message.guild.id)?.connection;
    if(!connection || !isInBotVoiceChannel(message)) {
        debugLog(`[Speech][Filter] Conexion ausente o canal cambiado guild=${message.guild.id} user=${speaker}`);
        return;
    }

    if(stateJudging.get(message.guild.id)){
        debugLog(`[Speech][Command] Juicio activo guild=${message.guild.id} user=${speaker} text="${message.content}"`);
        handleJudgment(message);
        return;
    }else{
        stateJudging.set(message.guild.id, false);
    }

    const messageContent = message.content;

    if(message.content.startsWith(getVoiceText(LangKeys.SALUTE_VOICE_COMMAND, message.guild.id))){
        salute(message.guild.id);
        return;
    }

    if(!messageContent.includes
        (getVoiceText(LangKeys.ACTIVATION_VOICE_COMMAND, message.guild.id))
    ){
        return;
    }
    const activationCommand = getVoiceText(LangKeys.ACTIVATION_VOICE_COMMAND, message.guild.id);
    const realMessageContent = messageContent.startsWith(activationCommand) ? messageContent.slice(activationCommand.length).trim() : messageContent;

    if(realMessageContent.length === 0) return;
    if(!controlChipiPunishment(message)) return;

    debugLog(`[Speech][Command] Texto comando guild=${message.guild.id} user=${speaker} text="${realMessageContent}"`);

    const classification = classifySpeechLocally(realMessageContent) ?? await clasificateSpeech(realMessageContent);
    debugLog(`[Speech][Command] Clasificacion guild=${message.guild.id} user=${speaker} option=${classification.option} confidence=${classification.confidence}`);
    if (classification.confidence < MIN_CLASSIFICATION_CONFIDENCE) {
        debugLog(`[Speech][Filter] Baja confianza guild=${message.guild.id} option=${classification.option} confidence=${classification.confidence}`);
        return;
    }

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
                debugLog("aliasUsers es: " + aliasUsers);
            }
            if(userToInsult){
                insultUser(userToInsult, message.guild.id);
            }else{
                globalInsult(message.guild.id);
            }
            break;
        case "juicio":
            debugLog("JUDGMENT");
        
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
            const song = realMessageContent
                .replace(/^(pon|ponme|reproduce)\s*/i, "")
                .replace(new RegExp(`^${getVoiceText(LangKeys.MUSIC_VOICE_COMMAND, message.guild.id)}\\s*`), "")
                .trim();
            debugLog("MUSIC TEXT: " + song);
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
            let textAfterCommand = realMessageContent.replace(new RegExp(`^${getVoiceText(LangKeys.THINK_VOICE_COMMAND, message.guild.id)}\\s*`), "").trim();
            if(textAfterCommand.length === 0 && realMessageContent.length > 0){
                textAfterCommand = realMessageContent;
            }
            stopAudio(message.guild.id);
            askOpenAi(textAfterCommand, message.guild.id);
            break;
        case "alerta":
            alertUsers(message);
            break;
        case "numero_aleatorio":
            stopAudio(message.guild.id);
            speakText(` ${(Math.random() * 10).toFixed()}`, message.guild.id);
            break;
        case "none":
            debugLog("Comando no reconocido.");
            break;
        default:
            debugLog("Comando no implementado o no reconocido.");
            break;
    }
        



}
