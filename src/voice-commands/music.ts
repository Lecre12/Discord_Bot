import { AudioPlayer, AudioPlayerStatus, AudioResource, createAudioPlayer, createAudioResource, NoSubscriberBehavior, StreamType, VoiceConnection } from "@discordjs/voice";
import { speakText } from "../util/ttsUtil";
import { promisify } from "util";
import { exec } from 'child_process';
import { Semaphore } from "../util/semaphore";
import path from "path";
import fs from 'fs';
import { getAudioPlayer, getBuildedAudioPlayer, removeAudioPlayer } from "..";

const execPromise = promisify(exec);
let alreadyRequested = false;
const semDoubles = new Semaphore(1);
const semChangeSong = new Semaphore(1);

export async function playSong(song: string, connection: VoiceConnection, guildId: string) {
    await semDoubles.acquire();
        if(alreadyRequested){
            console.log("No majo, no ya hay una canción en marcha.");
        
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
            alreadyRequested = false;
            semDoubles.release();
            return;
        }
        
        console.log(streamURL);
        // Creamos el stream de audio usando la URL obtenida
        const songPath = path.resolve(__dirname, `../../songs/song-${song.length}-${song}.mp3`);
        let resource: AudioResource<null> | null = createAudioResource(songPath, {
            //inputType: StreamType.Opus,
            inlineVolume: true
        });
    
        resource.volume?.setVolume(0.1);
        console.log("Es leible: " + resource?.readable);
        
        const audioPlayer = getBuildedAudioPlayer(guildId);
        if(!audioPlayer) return;
    
        console.log("Reproduciendo la canción...");
        audioPlayer.play(resource);
        const audioPlayerSubscribe = connection.subscribe(audioPlayer);
        
        audioPlayer.once(AudioPlayerStatus.Idle, async () => {
            //speakText("Se ha terminado la canción", connection, guildId);
            alreadyRequested = false;
            audioPlayerSubscribe?.unsubscribe();
            await deleteFile(songPath, guildId);
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

export async function deleteFile(filePath: string, guildId: string): Promise<void> {
    
    setTimeout(() => {
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error(`Error al intentar borrar el archivo: ${err.message}`);
                return;
            }
            console.log(`Archivo ${filePath} borrado exitosamente.`);
        });
        console.log(getAudioPlayer(guildId));
        semChangeSong.release();
    }, 5000);
    
    /*try {
        fs.unlinkSync(filePath);
        console.log(`Archivo eliminado: ${filePath}`);
    } catch (error) {
        console.error(`Error al eliminar el archivo: ${error}`);
    }*/
}