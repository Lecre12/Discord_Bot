import { AudioPlayer, AudioPlayerStatus, createAudioPlayer, createAudioResource, NoSubscriberBehavior, StreamType, VoiceConnection } from "@discordjs/voice";
import { speakText } from "../util/ttsUtil";
import { promisify } from "util";
import { exec } from 'child_process';
import { Semaphore } from "../util/semaphore";
import path from "path";
import { wait } from "../util/wait";
import fs from 'fs';

const execPromise = promisify(exec);
let alreadyRequested = false;
const semDoubles = new Semaphore(1);
const semChangeSong = new Semaphore(1);

let audioPlayer: AudioPlayer | null;
export function getAudioPlayer(){
    return audioPlayer;
}

export async function playSong(song: string, connection: VoiceConnection, guildId: string) {
    await semDoubles.acquire();
        if(alreadyRequested){
            console.log("No majo, no ya hay una cancion en marcha.");
        
            semDoubles.release();
            return;
        }
        alreadyRequested = true;
        semDoubles.release();
        console.log("Busco: " + song);
    try {
        speakText("Estoy buscando la cancion, espera", connection, guildId);
        const streamURL = await getStreamURL(song, guildId);
        if (!streamURL) {
            console.log("Canción no encontrada.");
            return;
        }
        
        console.log(streamURL);
        // Creamos el stream de audio usando la URL obtenida
        const songPath = path.resolve(__dirname, `../../songs/song-${song.length}-${song}.mp3`);
        const resource = createAudioResource(songPath, {
            //inputType: StreamType.Opus,
            inlineVolume: true
        });
    
        resource.volume?.setVolume(0.1);
        
        audioPlayer = createAudioPlayer({
            behaviors: {
            noSubscriber: NoSubscriberBehavior.Pause
            }
        });
    
        console.log("Reproduciendo la canción...");
        audioPlayer.play(resource);
        connection.subscribe(audioPlayer);
        
        //console.log(resource);
        audioPlayer.on(AudioPlayerStatus.Idle, async () => {
            speakText("Se ha terminado la canción", connection, guildId);
            alreadyRequested = false;
            semDoubles.release();
            return;
        });
    
        audioPlayer.on("error", (error) => {
            console.error("Error al reproducir la canción:", error);
        });
        
        
    } catch (error) {
        console.error("Hubo un error al intentar reproducir la canción:", error);
    }
  }
async function getStreamURL(song: string, guildId: string): Promise<string | null> {
    try {
      // Usamos yt-dlp para obtener el enlace de audio del video de YouTube
      const songPath = path.resolve(__dirname, `../../songs/song-${song.length}-${song}.mp3`);
      const { stdout } = await execPromise(`yt-dlp -f bestaudio[ext=webm] -o "${songPath}" --no-post-overwrites "ytsearch:${song}"`);
      return stdout.trim();
    } catch (error) {
      console.error("Error al obtener la URL del audio:", error);
      return null;
    }
  }

export function deleteFile(filePath: string): void {
    setTimeout(() => {
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error(`Error al intentar borrar el archivo: ${err.message}`);
                return;
            }
            console.log(`Archivo ${filePath} borrado exitosamente.`);
        });
        semChangeSong.release();
    }, 1000)
}