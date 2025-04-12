import { AudioPlayer, AudioPlayerStatus, AudioResource, createAudioPlayer, createAudioResource, NoSubscriberBehavior, StreamType, VoiceConnection } from "@discordjs/voice";
import { speakText } from "../util/ttsUtil";
import { promisify } from "util";
import { exec } from 'child_process';
import { Semaphore } from "../util/semaphore";
import path from "path";
import fs from 'fs';
import { getAudioPlayer, getBuildedAudioPlayer, removeAudioPlayer } from "..";
import { getMessage } from "../lang/lang-manager";
import { LangKeys } from "../lang/lang-keys";
import { stopAllAuidio } from "../handlers/speechHandler";

const execPromise = promisify(exec);

const alreadyRequestedGuild = new Map<string, { alreadyRequested: boolean, songList: Array<string> }>();

export async function playSong(song: string, connection: VoiceConnection, guildId: string) {

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
        speakText(getMessage(LangKeys.CONFIRMATION_SEARCHING_SONG, guildId), connection, guildId);
        const streamURL = await getStreamURL(song, guildId);
        if (!streamURL) {
            console.log("Canción no encontrada.");
            speakText(getMessage(LangKeys.ERR_SONG_NOT_FOUND, guildId), connection, guildId);
            alreadyRequestedGuild.get(guildId)!.alreadyRequested = false;
            return;
        }
        
        console.log(streamURL);
        // Creamos el stream de audio usando la URL obtenida
        const songPath = path.resolve(__dirname, `../../songs/song-${song.length}-${song}.wav`);
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
            alreadyRequestedGuild.get(guildId)!.alreadyRequested = false;
            if(alreadyRequestedGuild.get(guildId)!.songList.length > 0){
                nextSong(guildId, connection);
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
async function getStreamURL(song: string, guildId: string): Promise<string | null> {
    try {
      // Usamos yt-dlp para obtener el enlace de audio del video de YouTube
      const songPath = path.resolve(__dirname, `../../songs/song-${song.length}-${song}.wav`);
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
    }, 1000);
    
    /*try {
        fs.unlinkSync(filePath);
        console.log(`Archivo eliminado: ${filePath}`);
    } catch (error) {
        console.error(`Error al eliminar el archivo: ${error}`);
    }*/
}

export async function clearSongList(guildId: string){
    if(!alreadyRequestedGuild.get(guildId)){
        alreadyRequestedGuild.set(guildId, {alreadyRequested: false, songList: new Array<string>});
        
    }
    alreadyRequestedGuild.get(guildId)!.songList = new Array<string>;
    console.log("Se ha eliminado la lista de canciones: " + alreadyRequestedGuild.get(guildId)!.songList.length);
}

export function nextSong(guildId: string, connection: VoiceConnection){
    if(alreadyRequestedGuild.get(guildId)!.songList.length > 0 && alreadyRequestedGuild.get(guildId)!.songList){
        alreadyRequestedGuild.get(guildId)!.alreadyRequested = false;
        const nextSong = alreadyRequestedGuild.get(guildId)!.songList.shift()!;
        playSong(nextSong, connection, guildId);
    }else{
        stopAllAuidio(guildId);
    }
}