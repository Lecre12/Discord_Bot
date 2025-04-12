import { createAudioResource } from "@discordjs/voice";
import { getServerData } from "./server-data";
import { Readable } from "stream";

const emptyStream = () => Readable.from([]);
export const serverCanContinue = new Map<string, {canContinue: boolean}>();

export function stopAllAudio(guildId: string) {
    serverCanContinue.set(guildId, { canContinue: false });
    getServerData(guildId)?.audioPlayer?.play(createAudioResource(emptyStream()));
    getServerData(guildId)?.audioPlayer?.stop();
}