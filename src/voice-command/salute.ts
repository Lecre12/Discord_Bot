import path from "path";
import { STATIC_AUDIO_DIR } from "../constant/paths";
import { debugLog } from "../util/debug-log";
import { playAudio } from "../util/play-audio";

export function salute(guildId: string){
    debugLog("Salute command received for guild: " + guildId);
    playAudio(path.join(STATIC_AUDIO_DIR, "hola-emotiza.mp3"), guildId);
}
