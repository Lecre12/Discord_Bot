import { AudioPlayerStatus, createAudioPlayer, createAudioResource, NoSubscriberBehavior } from "@discordjs/voice";
import path from "path";
import { getBuildedAudioPlayer, getConnection, removeAudioPlayer } from '..';
import { stopAllAuidio } from "../handlers/speechHandler";

let numberOfSalutes: number = 0;;
export async function salute(guildId: string){
    const connection = getConnection(guildId);
    const audioPlayer = getBuildedAudioPlayer(guildId);
    if(!audioPlayer) return;
    numberOfSalutes++;
    console.log("numero de saludos: " + numberOfSalutes);
    if(numberOfSalutes > 2){
        await stopAllAuidio(guildId);
        if(connection){
            let songPath;
            switch((Math.random() * 4).toFixed()){
                case '1':
                    console.log(1);
                    songPath = path.resolve(__dirname, `../../hola-emotiza.mp3`);
                    //songPath = path.resolve(__dirname, `../../se-me-sale-la-caca.mp3`);
                    break;
                case '2':
                    console.log(2)
                    songPath = path.resolve(__dirname, `../../hola-emotiza.mp3`);
                    break;
                case '3':
                    console.log(3)
                    //songPath = path.resolve(__dirname, `../../el-senor-de-la-noche-don-omar.mp3`);
                    songPath = path.resolve(__dirname, `../../hola-emotiza.mp3`);
                    break
                default:
                    console.log("defaoult")
                    //songPath = path.resolve(__dirname, `../../el-senor-de-la-noche-don-omar.mp3`);
                    songPath = path.resolve(__dirname, `../../hola-emotiza.mp3`);
            }
            const resource = createAudioResource(songPath, {
                //inputType: StreamType.Opus,
                inlineVolume: true
            });
            resource.volume?.setVolume(0.08);
        
            
            console.log("Reproduciendo la Saludo...");
            audioPlayer.play(resource);
            const audioPlayerSubscribe = connection.subscribe(audioPlayer);
            audioPlayer.once(AudioPlayerStatus.Idle, async () => {
                audioPlayerSubscribe?.unsubscribe();
                removeAudioPlayer(guildId);
                return;
            });
        }
        
        numberOfSalutes = 0;
    }
}

