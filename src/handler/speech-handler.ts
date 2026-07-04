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
import { getOpenIa } from "../util/open-ia";
import { disconnectBot } from "../voice-command/disconnect";

const lastSpeechTimes = new Map<string, number>();
let lastCommandChipi: number = 0;
const chipiCooldown = 600000;
const stateJudging = new Map<string, boolean>();

type ClassifiedVoiceCommand =
    "salute" |
    "stop" |
    "disconnect" |
    "music" |
    "kick" |
    "nuke" |
    "think" |
    "mute" |
    "speak" |
    "deaf" |
    "move" |
    "who_connected" |
    "delete_song_list" |
    "next_song" |
    "random_number" |
    "alert" |
    "russian_roulette" |
    "shoot_random" |
    "sound" |
    "judgment" |
    "insult" |
    "none";

type CommandClassification = {
    command: ClassifiedVoiceCommand;
    argument?: string;
};

const openIa = getOpenIa();
const VALID_CLASSIFIED_COMMANDS: ClassifiedVoiceCommand[] = [
    "salute",
    "stop",
    "disconnect",
    "music",
    "kick",
    "nuke",
    "think",
    "mute",
    "speak",
    "deaf",
    "move",
    "who_connected",
    "delete_song_list",
    "next_song",
    "random_number",
    "alert",
    "russian_roulette",
    "shoot_random",
    "sound",
    "judgment",
    "insult",
    "none",
];
const COMMANDS_WITH_ARGUMENTS: ClassifiedVoiceCommand[] = ["music", "kick", "think", "mute", "deaf", "move", "sound", "insult"];

function normalizeSpeech(text: string): string {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

function getActivationVariants(guildId: string): string[] {
    return [
        "oye marron",
        "oye marrón",
        getMessage(LangKeys.ACTIVATION_VOICE_COMMAND, guildId),
    ].filter(Boolean);
}

function getTextAfterActivation(content: string, guildId: string): string | undefined {
    const normalizedContent = normalizeSpeech(content);

    for (const activation of getActivationVariants(guildId)) {
        const normalizedActivation = normalizeSpeech(activation);
        if (normalizedContent === normalizedActivation) return "";
        if (normalizedContent.startsWith(normalizedActivation + " ")) {
            return content.slice(activation.length).trim();
        }
    }

    return undefined;
}

function isSaluteException(content: string, guildId: string): boolean {
    const saluteCommand = getMessage(LangKeys.SALUTE_VOICE_COMMAND, guildId);
    const normalizedContent = normalizeSpeech(content);

    return ["hola marron", "hola marrón", saluteCommand]
        .filter(Boolean)
        .some((salute) => normalizedContent.startsWith(normalizeSpeech(salute)));
}

function buildCommandContent(classification: CommandClassification, guildId: string): string | undefined {
    const activation = getMessage(LangKeys.ACTIVATION_VOICE_COMMAND, guildId);
    const argument = classification.argument?.trim();

    const commandByClassification: Record<Exclude<ClassifiedVoiceCommand, "none" | "who_connected" | "random_number">, LangKeys> = {
        salute: LangKeys.SALUTE_VOICE_COMMAND,
        stop: LangKeys.STOP_VOICE_COMMAND,
        disconnect: LangKeys.DISCONNECT_VOICE_COMMAND,
        music: LangKeys.MUSIC_VOICE_COMMAND,
        kick: LangKeys.KICK_VOICE_COMMAND,
        nuke: LangKeys.NUKE_VOICE_COMMAND,
        think: LangKeys.THINK_VOICE_COMMAND,
        mute: LangKeys.MUTE_VOICE_COMMAND,
        speak: LangKeys.SPEAK_VOICE_COMMAND,
        deaf: LangKeys.DEAF_VOICE_COMMAND,
        move: LangKeys.MOVE_VOICE_COMMAND,
        delete_song_list: LangKeys.DELETE_SONG_LIST_VOICE_COMMAND,
        next_song: LangKeys.NEXT_SONG_VOICE_COMMAND,
        alert: LangKeys.ALERT_VOICE_COMMAND,
        russian_roulette: LangKeys.RUSSIAN_ROULETTE_VOICE_COMMAND,
        shoot_random: LangKeys.SHOOT_RANDOM_VOICE_COMMAND,
        sound: LangKeys.SOUND_VOICE_COMMAND,
        judgment: LangKeys.JUDGMENT_VOICE_COMMAND,
        insult: LangKeys.INSULT_VOICE_COMMAND,
    };

    if (classification.command === "none") return undefined;
    if (classification.command === "salute") {
        return getMessage(LangKeys.SALUTE_VOICE_COMMAND, guildId);
    }
    if (classification.command === "who_connected") {
        return `${activation} ${getMessage(LangKeys.WHO_VOICE_COMMAND, guildId)} ${getMessage(LangKeys.CONNECTED_VOICE_COMMAND, guildId)}`;
    }
    if (classification.command === "random_number") {
        return `${activation} ${getMessage(LangKeys.NUMBER_VOICE_COMMAND, guildId)} ${getMessage(LangKeys.RANDOM_VOICE_COMMAND, guildId)}`;
    }

    const command = getMessage(commandByClassification[classification.command], guildId);
    const baseContent = `${activation} ${command}`;
    if (COMMANDS_WITH_ARGUMENTS.includes(classification.command) && argument) {
        return `${baseContent} ${argument}`;
    }

    return baseContent;
}

async function classifyVoiceCommand(textAfterActivation: string, guildId: string): Promise<string | undefined> {
    try {
        if (!textAfterActivation) return undefined;

        const aliasUsers = Object.keys(getServerData(guildId)?.aliasUsers || {});
        const moveChannels = Object.keys(getServerData(guildId)?.moveChannels || {});

        const response = await openIa.chat.completions.create({
            model: "gpt-4.1-nano",
            response_format: { type: "json_object" },
            messages: [
                {
                    role: "system",
                    content:
                        "Clasifica una orden de voz para un bot de Discord. " +
                        "Responde solo JSON valido con esta forma: {\"command\":\"...\",\"argument\":\"...\"}. " +
                        "Comandos validos: salute, stop, disconnect, music, kick, nuke, think, mute, speak, deaf, move, who_connected, delete_song_list, next_song, random_number, alert, russian_roulette, shoot_random, sound, judgment, insult, none. " +
                        "Clasifica por significado e intencion, no por coincidencia literal de palabras. Ten en cuenta sinonimos, expresiones coloquiales, indirectas, bromas y segundos significados. " +
                        "Ejemplos de intencion: saludos, buenas, dime hola o presentate => salute; pon musica, reproduce, busca una cancion, pincha, dale al temazo => music; calla, para, silencio, corta el audio, apaga eso => stop; salte del canal, desconectate, vete de la llamada, abandona voz => disconnect; siguiente, saltala, pasa cancion => next_song; limpia la cola, borra playlist, vacia canciones => delete_song_list; numero al azar, tirame un dado, dime uno random => random_number; quien hay, quienes estan, quien sigue vivo => who_connected; piensa, responde, dime, explicame, pregunta, consulta o cualquier duda general => think; echa, manda fuera, expulsa o saca a alguien => kick; todos fuera, limpia el canal, nukea => nuke; mutea, silencia, cierra el micro => mute; ensordece, deja sin oir => deaf; devuelve voz, desmutea, que pueda hablar/oír => speak; mueve, lleva, cambia al canal => move; alarma, despierta, avisa => alert; ruleta, jugamos a la ruleta => russian_roulette; dispara, tiro aleatorio => shoot_random; sonido, efecto, sample => sound; juicio, juzga, tribunal => judgment; insulta, metete con, roast => insult. " +
                        "Si una frase puede ser comando o charla, prioriza comando solo cuando haya una accion clara para el bot. Si es una pregunta general, usa think. " +
                        "En argument pon solo el alias, canal, cancion, sonido o pregunta que necesita el comando, conservando las palabras importantes del usuario. Si no hay argumento, usa string vacio. Si no encaja con nada, command debe ser none."
                },
                {
                    role: "user",
                    content:
                        `Texto: ${textAfterActivation}\n` +
                        `Alias de usuarios disponibles: ${aliasUsers.join(", ") || "ninguno"}\n` +
                        `Alias de canales disponibles: ${moveChannels.join(", ") || "ninguno"}`
                }
            ],
            temperature: 0,
            max_tokens: 80,
        });

        const rawClassification = response.choices[0]?.message.content;
        if (!rawClassification) return undefined;

        const classification = JSON.parse(rawClassification) as CommandClassification;
        if (!VALID_CLASSIFIED_COMMANDS.includes(classification.command)) return undefined;

        return buildCommandContent(classification, guildId);
    } catch (err) {
        console.error("Error clasificando comando de voz con IA: " + err);
        return undefined;
    }
}

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
    if(isSaluteException(message.content, message.guild.id)){
        salute(message.guild.id);
        return;
    }

    const textAfterActivation = getTextAfterActivation(message.content, message.guild.id);
    if(textAfterActivation === undefined) return;

    const classifiedCommandContent = await classifyVoiceCommand(textAfterActivation, message.guild.id);
    if(!classifiedCommandContent) return;

    message.content = classifiedCommandContent.toLowerCase();
    console.log("CLASSIFIED VOICE COMMAND: " + message.content);

    if(message.content.startsWith(getMessage(LangKeys.SALUTE_VOICE_COMMAND, message.guild.id))){
        salute(message.guild.id);
        return;
    }else if(message.content.startsWith(getMessage(LangKeys.ACTIVATION_VOICE_COMMAND, message.guild.id) + " " + getMessage(LangKeys.STOP_VOICE_COMMAND, message.guild.id))){
        stopAudio(message.guild.id);
        return;
    }else if(message.content.startsWith(getMessage(LangKeys.ACTIVATION_VOICE_COMMAND, message.guild.id) + " " + getMessage(LangKeys.DISCONNECT_VOICE_COMMAND, message.guild.id))){
        disconnectBot(message);
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
