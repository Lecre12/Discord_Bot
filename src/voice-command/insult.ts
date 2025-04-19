import { GuildMember } from "discord.js";
import { INSULTS } from "../constant/insults";
import { InsultType } from "../type/insult-type";
import { speakText } from "../util/tts";

export function insultUser(member: GuildMember | undefined, guildId: string){
    const insult = INSULTS[Math.floor(Math.random() * INSULTS.length)];
    if (insult.type === InsultType.User && member) {
        const insultText = insult.text.replace("<nombre>", member.displayName);
        speakText(insultText, guildId);
    }else {
        speakText(insult.text, guildId);
    }
}

export function globalInsult(guildId: string){
    const insult = INSULTS[Math.floor(Math.random() * 6)];
    if (insult.type === InsultType.Global) {
        speakText(insult.text, guildId);
    }else {
        const backupInsult = INSULTS[4];
        speakText(backupInsult.text, guildId);
    }
}