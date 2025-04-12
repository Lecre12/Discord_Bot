import path from "path";
import { playAudio } from "../util/play-audio";

export function salute(guildId: string){
    console.log("Salute command received for guild: " + guildId);
    playAudio(path.resolve(__dirname, "../../static-audio/hola-emotiza.mp3"), guildId);
}