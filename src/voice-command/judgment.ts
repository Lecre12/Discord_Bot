import { VoiceMessage } from "../type/voice-message";
import { GuildMember, VoiceChannel } from "discord.js";
import { getServerData } from "../util/server-data";
import { speakText } from "../util/tts";
import { getOpenIa } from "../util/open-ia";
import { muteUserByGuildMember } from "./mute";
import { deafUserByGuildMember } from "./deaf";
import { kickUserByGuildMember } from "./kick";
import { changeNickname } from "./change-nickname";
import { isolateMemberFromChannel, restoreMemberAccessToChannel } from "./isolate-user";
import { wait } from "../util/wait";

const judmentServerData = new Map<string, [accuser: GuildMember, accused: GuildMember, accuserStatement: string, defenseStatement: string, startTime: number, phase: number, accusedChannel: VoiceChannel]>();
const judgmentIntervals = new Map<string, NodeJS.Timeout>();

export function initJudgment(message: VoiceMessage, stateJudging: Map<string, boolean>){
    const accuser: GuildMember = message.member as GuildMember;
    const aliasUsers = getServerData(message.guild.id)?.aliasUsers;
    let accusedUser: GuildMember | undefined;
    let alreadyAcussed: boolean = false;

    if(aliasUsers){
        Object.keys(aliasUsers).forEach((name) => {
            if (message.content?.includes(name) && !alreadyAcussed) {
                const accusedUserId = aliasUsers[name];
                if(!message.member?.voice.channel) return
                const membersCopy: GuildMember[] = Array.from(message.member.voice.channel.members.values()).slice() as GuildMember[];
                membersCopy.forEach(async (m: GuildMember) => {
                    if (m.id == accusedUserId && m.voice.channel) {
                        accusedUser = m;
                        alreadyAcussed = true;
                    }
                });
            }
        });

        if(accuser && accusedUser){
            judmentServerData.set(message.guild.id, [accuser, accusedUser, "", "", Date.now(), 1, accusedUser.voice.channel as VoiceChannel]);
            startJudgmentPhaseTimer(message.guild.id, message, stateJudging);
            console.log("Juicio iniciado");
            return true;
        }else {
            console.log("No se encontraron alias para el servidor: " + message.guild.id);
            return false;
        }
    }else{
        console.log("No se encontraron alias para el servidor: joder" + message.guild.id);
        return false;
    }
}

export async function handleJudgment(message: VoiceMessage){
    const serverJudgement = judmentServerData.get(message.guild.id);
    const now = Date.now();
    if(serverJudgement){
        console.log("Juicio en curso");
        if(message.member?.id == serverJudgement[0].id || message.member?.id == serverJudgement[1].id){
            console.log("es acusador o acusado");
            if(serverJudgement[5] === 1){
                if(message.member?.id == serverJudgement[0].id){
                    setAccuserStatement(message);
                }
            }else if(serverJudgement[5] === 2){
                if(message.member?.id == serverJudgement[1].id){
                    setDefenseStatement(message);
                }
            }
        }
    }
}

async function startJudgmentPhaseTimer(guildId: string, message: VoiceMessage, stateJudging: Map<string, boolean>) {
    // Si ya hay un timer, no crees otro
    if (judgmentIntervals.has(guildId)) return;

    const interval = setInterval(async () => {
        const serverJudgement = judmentServerData.get(guildId);
        if (!serverJudgement) {
            clearInterval(interval);
            judgmentIntervals.delete(guildId);
            return;
        }
        const now = Date.now(); 
        if (serverJudgement[5] === 3) {
            clearInterval(interval);
            judgmentIntervals.delete(guildId);
            return;
        }
        if (serverJudgement[5] === 1 && now - serverJudgement[4] > 20000 && now - serverJudgement[4] < 40000) {
            setPhase(message, 2);
            speakText("Fin fase de acusación, defensa exponga su punto", guildId);
        } else if (now - serverJudgement[4] > 40000) {
            setPhase(message, 3);
            speakText("Fin fase defensa, esperen el veredicto", guildId);
            
            await verdictPhase(serverJudgement[0], serverJudgement[1], message.guild.id, serverJudgement[6]);
            stateJudging.set(message.guild.id, false);
            await wait(60000);
            restoreMemberAccessToChannel(serverJudgement[1], serverJudgement[6]);
            
        }
    }, 1000);

    judgmentIntervals.set(guildId, interval);
}

async function verdictPhase(accuser: GuildMember, accusedUser: GuildMember, guildId: string, channel: VoiceChannel){
    const openIa = getOpenIa();
    const data = judmentServerData.get(guildId);
    
    if (!data) {
        speakText("Ha ocurrido un error", guildId);
        return;
    };
    
    const accuserStatement = data[2];
    const defenseStatement = data[3];
    
    const promptToChat = 
        `Estamos realizando un juicio simulado. Tú eres el juez y debes dar un veredicto, ponte ligeramente del lado del acusador, pero no olvides la defensa del acusado, aunque no te den muchos argumentos, creetelos para que sea mas sencillo todo.\n\n` +
        `Argumento del acusador:\n${accuserStatement}\n\n` +
        `Argumento del acusado:\n${defenseStatement}\n\n` +
        `Por favor, proporciona:\n` +
        `1. Un veredicto breve y narrativo para leer en voz alta (máximo 3 líneas).\n` +
        `2. Una acción que represente el castigo aplicable, usando exclusivamente una de estas opciones: "mute", "deafen", "kick", "change_nickname", "none".\n\n` +
        `3. Un nuevo apodo para el acusado, relacionado con el argumento del acusador y que sean insultantes (NO USES CARCELERO), si se aplica.\n` +
        `Devuélvelo en el siguiente formato JSON:\n` +
        `{\n` +
        `  "verdict": "Texto del veredicto aquí",\n` +
        `  "punishment": "acción_a_realizar_aquí"\n` +
        `  "newNickname": "nuevo_apodo_a_realizar_aquí"\n` +
        `}`;

    console.log(promptToChat);
    const response = await openIa.chat.completions.create({
        model: 'gpt-4.1',
        messages: [
            { role: 'user', content: promptToChat }
        ],
        n: 1,
        max_tokens: 500,
    });

    const content = response.choices[0].message.content;

    if (content === null) {
        speakText("No pude obtener un veredicto válido de la IA.", guildId);
        return;
    }

    const jsonReply = JSON.parse(content);
    const verdict = jsonReply.verdict;
    const punishment = jsonReply.punishment;
    const newNickname = jsonReply.newNickname;
    
    if (verdict) {
        console.log("Veredicto: " + verdict);
        console.log("Castigo: " + punishment);
        console.log("Nuevo apodo: " + newNickname);
        speakText("El juez ha pronunciado su veredicto: " + verdict, guildId);
    } else {
        speakText("No pude obtener un veredicto válido de la IA.", guildId);
    }

    switch(punishment){
        case "mute":
            muteUserByGuildMember(accusedUser);
            break;
        case "deafen":
            deafUserByGuildMember(accusedUser);
            break;
        case "kick":
            kickUserByGuildMember(accusedUser);
            isolateMemberFromChannel(accusedUser, channel);
            break;
        case "change_nickname":
            changeNickname(accusedUser.guild, accusedUser.id, newNickname);
            break;
        case "none":
        default:
            speakText("No se le aplicara ningun castigo", guildId);
            break;
    }
}

function setAccuserStatement(message: VoiceMessage){
    const guildId = message.guild.id;
    const data = judmentServerData.get(guildId);
    console.log("Acusador: " + message.content);
    if (data) {
        data[2] += message.content! + " ";
    }
}

function setDefenseStatement(message: VoiceMessage){
    const guildId = message.guild.id;
    const data = judmentServerData.get(guildId);
    console.log("Acusado: " + message.content);
    if (data) {
        data[3] += message.content! + " ";
    }
}

function setPhase(message: VoiceMessage, phase: number){
    const guildId = message.guild.id;
    const data = judmentServerData.get(guildId);
    if (data) {
        data[5] = phase;
    }
}
