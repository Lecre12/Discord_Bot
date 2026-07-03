import { AudioPlayerStatus, AudioResource, createAudioPlayer, createAudioResource } from "@discordjs/voice";
import { exec } from "child_process";
import { createReadStream, mkdirSync } from "fs";
import path from "path";
import { promisify } from "util";
import { LangKeys } from "../lang/lang-keys";
import { getMessage } from "../lang/lang-manager";
import { speakText } from "../util/tts";
import { deleteFile } from "../handler/file-handler";
import { stopAllAudio } from "./audio-continue";
import { getServerData, setAudioPlayer } from "./server-data";

const execPromise = promisify(exec);
const alreadyRequestedGuild = new Map<string, { alreadyRequested: boolean, songList: Array<string> }>();

function ensureGuildQueue(guildId: string) {
    if (!alreadyRequestedGuild.get(guildId)) {
        alreadyRequestedGuild.set(guildId, { alreadyRequested: false, songList: [] });
    }

    return alreadyRequestedGuild.get(guildId)!;
}

function isYoutubeUrl(input: string): boolean {
    return /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//i.test(input.trim());
}

function getSongPath(song: string): string {
    const safeName = song
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9-_]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80) || "song";

    const songsDir = path.resolve(__dirname, "../../songs");
    mkdirSync(songsDir, { recursive: true });
    return path.join(songsDir, `song-${Date.now()}-${safeName}.wav`);
}

async function downloadSong(song: string): Promise<string | null> {
    try {
        const songPath = getSongPath(song);
        const ytDlpPath = path.resolve(__dirname, "../../yt-dlp/yt-dlp.exe");
        const source = isYoutubeUrl(song) ? song : `ytsearch:${song}`;
        await execPromise(`"${ytDlpPath}" -x --audio-format wav -o "${songPath}" --no-post-overwrites "${source}"`);
        return songPath;
    } catch (error) {
        console.error("Error al obtener el audio:", error);
        return null;
    }
}

export async function playSong(song: string, guildId: string) {
    const queue = ensureGuildQueue(guildId);

    if (queue.alreadyRequested) {
        console.log("Ya hay una cancion en marcha, añado a la cola: " + song);
        queue.songList.push(song);
        return;
    }

    queue.alreadyRequested = true;
    console.log("Busco: " + song);

    try {
        speakText(getMessage(LangKeys.CONFIRMATION_SEARCHING_SONG, guildId), guildId);
        const songPath = await downloadSong(song);
        if (!songPath) {
            console.log("Cancion no encontrada.");
            speakText(getMessage(LangKeys.ERR_SONG_NOT_FOUND, guildId), guildId);
            queue.alreadyRequested = false;
            return;
        }

        const connection = getServerData(guildId)?.connection;
        if (!connection) {
            queue.alreadyRequested = false;
            await deleteFile(songPath, guildId);
            return;
        }

        const stream = createReadStream(songPath);
        const resource: AudioResource<null> = createAudioResource(stream, { inlineVolume: true });
        resource.volume?.setVolume(0.1);

        let audioPlayer = getServerData(guildId)?.audioPlayer;
        if (!audioPlayer) {
            audioPlayer = createAudioPlayer();
            setAudioPlayer(audioPlayer, guildId);
        }

        audioPlayer.play(resource);
        const audioPlayerSubscribe = connection.subscribe(audioPlayer);

        audioPlayer.once(AudioPlayerStatus.Idle, async () => {
            queue.alreadyRequested = false;
            stream.close();
            if (queue.songList.length > 0) {
                nextSong(guildId);
                await deleteFile(songPath, guildId);
            } else {
                audioPlayerSubscribe?.unsubscribe();
                clearSongList(guildId);
                await deleteFile(songPath, guildId);
            }
        });

        audioPlayer.once("error", (error) => {
            queue.alreadyRequested = false;
            console.error("Error al reproducir la cancion:", error);
        });
    } catch (error) {
        queue.alreadyRequested = false;
        console.error("Hubo un error al intentar reproducir la cancion:", error);
    }
}

export async function clearSongList(guildId: string) {
    const queue = ensureGuildQueue(guildId);
    queue.songList = [];
    console.log("Se ha eliminado la lista de canciones: " + queue.songList.length);
}

export function nextSong(guildId: string) {
    const queue = ensureGuildQueue(guildId);
    if (queue.songList.length > 0) {
        queue.alreadyRequested = false;
        const nextQueuedSong = queue.songList.shift()!;
        playSong(nextQueuedSong, guildId);
    } else {
        stopAllAudio(guildId);
    }
}
