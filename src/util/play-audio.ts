import { AudioPlayerStatus, createAudioPlayer, createAudioResource } from "@discordjs/voice";
import { getServerData } from "./server-data";
import { setAudioPlayer } from "./server-data";
import { createReadStream, existsSync } from "fs";
import { debugLog } from "./debug-log";

export function playAudio(filePath: string, guildId: string) {
    if (!existsSync(filePath)) {
        console.warn(`No se ha encontrado el audio: ${filePath}`);
        return Promise.resolve();
    }

    const connection = getServerData(guildId)?.connection;
    if(!connection) return Promise.resolve();
    let audioPlayer = getServerData(guildId)?.audioPlayer;
    if(!audioPlayer){
        audioPlayer = createAudioPlayer();
        setAudioPlayer(audioPlayer, guildId);
    }

    const stream = createReadStream(filePath);
    stream.once("error", (error) => {
        console.warn(`Error leyendo audio ${filePath}:`, error);
    });

    const resource = createAudioResource(stream, {
        inlineVolume: true
    });

    resource.volume?.setVolume(0.1);

    audioPlayer.play(resource);
    connection.subscribe(audioPlayer);

    return new Promise<void>((resolve) => {
        audioPlayer.once(AudioPlayerStatus.Idle, () => {
            debugLog(`Audio terminado: ${filePath}`);
            stream.close();
            resolve();
        });
    });
}
