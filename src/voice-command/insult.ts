import { GuildMember } from "discord.js";
import { INSULTS } from "../constant/insults";
import { InsultType } from "../type/insult-type";
import { speakText } from "../util/tts";

export function insultUser(member: GuildMember, guildId: string){
    const userInsults = INSULTS.filter(i => i.type === InsultType.User);
    const otherInsults = INSULTS.filter(i => i.type !== InsultType.User);
    const weightedInsults = [
        ...userInsults,
        ...userInsults,
        ...userInsults,
        ...otherInsults
    ];
    const insult = weightedInsults[Math.floor(Math.random() * weightedInsults.length)];
    if (insult.type === InsultType.User) {
        const insultText = insult.text.replace("<nombre>", member.displayName);
        speakText(insultText, guildId);
    } else {
        speakText(insult.text, guildId);
    }
}

export function globalInsult(guildId: string){
    const insult = INSULTS[Math.floor(Math.random() * 8)];
    if (insult.type === InsultType.Global) {
        speakText(insult.text, guildId);
    }else {
        const backupInsult = INSULTS[4];
        speakText(backupInsult.text, guildId);
    }
}