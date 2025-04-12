import { AudioPlayerStatus, createAudioPlayer, createAudioResource } from "@discordjs/voice";
import { getServerData } from "./server-data";
import { setAudioPlayer } from "./server-data";
import { createReadStream } from "fs";
export function playAudio(filePath: string, guildId: string) {

    const connection = getServerData(guildId)?.connection;
    if(!connection) return;
    let audioPlayer = getServerData(guildId)?.audioPlayer;
    if(!audioPlayer){
        audioPlayer = createAudioPlayer();
        setAudioPlayer(audioPlayer, guildId);
    }

    const stream = createReadStream(filePath);
    const resource = createAudioResource(stream, {
        inlineVolume: true
    });

    resource.volume?.setVolume(0.1);

    audioPlayer.play(resource);
    connection.subscribe(audioPlayer);

    return new Promise<void>((resolve) => {
        audioPlayer.on(AudioPlayerStatus.Idle, () => {
            stream.close();
            resolve();
        });
    });
}