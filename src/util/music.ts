import { VoiceConnection, AudioResource, createAudioResource, AudioPlayerStatus, createAudioPlayer } from "@discordjs/voice";
import { execFile } from "child_process";
import path from "path";
import { promisify } from "util";
import { LangKeys } from "../lang/lang-keys";
import { getMessage } from "../lang/lang-manager";
import { speakText } from "../util/tts";
import { getServerData, setAudioPlayer } from "./server-data";
import { deleteFile } from "../handler/file-handler";
import { stopAllAudio } from "./audio-continue";
import { createReadStream, mkdirSync } from "fs";



const execFilePromise = promisify(execFile);

const alreadyRequestedGuild = new Map<string, { alreadyRequested: boolean, songList: Array<string> }>();

function getSongPath(song: string): string {
    const songsDir = path.resolve(__dirname, "../../songs");
    mkdirSync(songsDir, { recursive: true });

    const safeSongName = song
        .replace(/[<>:"/\\|?*]/g, "")
        .replace(/\s+/g, " ")
        .trim() || "song";

    return path.resolve(songsDir, `song-${safeSongName.length}-${safeSongName}.wav`);
}

function getYtDlpErrorSummary(error: unknown): string {
    if (error instanceof Error) {
        const commandError = error as Error & { stderr?: string };
        const stderr = commandError.stderr?.split(/\r?\n/).find((line) => line.startsWith("ERROR:"));
        return stderr || error.message.split(/\r?\n/)[0];
    }

    return String(error);
}

function getYtDlpPath(): string {
    const executableName = process.platform === "win32" ? "yt-dlp.exe" : "yt-dlp";
    return path.resolve(__dirname, "../../yt-dlp", executableName);
}

export async function playSong(song: string, guildId: string) {

        if(!alreadyRequestedGuild.get(guildId)){
            alreadyRequestedGuild.set(guildId, {alreadyRequested: false, songList: new Array<string>});
        }

        if(alreadyRequestedGuild.get(guildId)?.alreadyRequested){
            console.log("No majo, no ya hay una canción en marcha, añado a la cola: " + song);
            alreadyRequestedGuild.get(guildId)?.songList.push(song);
            return;
        }
        alreadyRequestedGuild.get(guildId)!.alreadyRequested = true;
        console.log("Busco: " + song);
    try {
        speakText(getMessage(LangKeys.CONFIRMATION_SEARCHING_SONG, guildId), guildId);
        const streamURL = await getStreamURL(song);
        if (!streamURL) {
            console.log("Canción no encontrada.");
            speakText(getMessage(LangKeys.ERR_SONG_NOT_FOUND, guildId), guildId);
            alreadyRequestedGuild.get(guildId)!.alreadyRequested = false;
            return;
        }
        
        console.log(streamURL);
        const songPath = getSongPath(song);
        const stream = createReadStream(songPath);
        let resource: AudioResource<null> | null = createAudioResource(stream, {
            inlineVolume: true
        });
    
        resource.volume?.setVolume(0.1);
        console.log("Es leible: " + resource?.readable);
        
        const connection = getServerData(guildId)?.connection;
        if(!connection) return;
        let audioPlayer = getServerData(guildId)?.audioPlayer;
        if(!audioPlayer){
            audioPlayer = createAudioPlayer();
            setAudioPlayer(audioPlayer, guildId);
        }
    
        console.log("Reproduciendo la canción...");
        audioPlayer.play(resource);
        const audioPlayerSubscribe = connection.subscribe(audioPlayer);
        
        audioPlayer.once(AudioPlayerStatus.Idle, async () => {
            alreadyRequestedGuild.get(guildId)!.alreadyRequested = false;
            stream.close();
            if(alreadyRequestedGuild.get(guildId)!.songList.length > 0){
                nextSong(guildId);
                await deleteFile(songPath, guildId);
            }else{
                audioPlayerSubscribe?.unsubscribe();
                clearSongList(guildId);
                await deleteFile(songPath, guildId);
            }
            
            return;
        });
    
        audioPlayer.on("error", (error) => {
            console.error("Error al reproducir la canción:", error);
        });
        
        
    } catch (error) {
        console.error("Hubo un error al intentar reproducir la canción:", error);
    }
  }
async function getStreamURL(song: string): Promise<string | null> {
    try {
      const songPath = getSongPath(song);
      const ytDlpPath = getYtDlpPath();
      const { stdout: searchStdout } = await execFilePromise(ytDlpPath, [
        "--flat-playlist",
        "--print",
        "id",
        "--no-warnings",
        `ytsearch10:${song} audio`,
      ]);

      const videoIds = searchStdout
        .split(/\r?\n/)
        .map((id) => id.trim())
        .filter(Boolean);

      for (const videoId of videoIds) {
        try {
          const { stdout } = await execFilePromise(ytDlpPath, [
            "-f",
            "bestaudio/best",
            "--extractor-args",
            "youtube:player_client=android,ios,tv",
            "--no-warnings",
            "-x",
            "--audio-format",
            "wav",
            "-o",
            songPath,
            "--no-post-overwrites",
            `https://www.youtube.com/watch?v=${videoId}`,
          ]);

          return stdout.trim() || songPath;
        } catch (downloadError) {
          console.warn(`No se pudo descargar el resultado ${videoId}. Probando el siguiente. ${getYtDlpErrorSummary(downloadError)}`);
        }
      }

      return null;
    } catch (error) {
      console.error("Error al obtener la URL del audio:", error);
      return null;
    }
}

export async function clearSongList(guildId: string){
    if(!alreadyRequestedGuild.get(guildId)){
        alreadyRequestedGuild.set(guildId, {alreadyRequested: false, songList: new Array<string>});
        
    }
    alreadyRequestedGuild.get(guildId)!.songList = new Array<string>;
    console.log("Se ha eliminado la lista de canciones: " + alreadyRequestedGuild.get(guildId)!.songList.length);
}

export function nextSong(guildId: string){
    if(alreadyRequestedGuild.get(guildId)!.songList.length > 0 && alreadyRequestedGuild.get(guildId)!.songList){
        alreadyRequestedGuild.get(guildId)!.alreadyRequested = false;
        const nextSong = alreadyRequestedGuild.get(guildId)!.songList.shift()!;
        playSong(nextSong, guildId);
    }else{
        stopAllAudio(guildId);
    }
}
