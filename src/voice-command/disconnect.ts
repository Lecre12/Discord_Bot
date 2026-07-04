import { VoiceMessage } from "discord-speech-recognition";
import { getServerData, setAudioPlayer, setConnection } from "../util/server-data";

export function disconnectBot(message: VoiceMessage): void {
    const connection = getServerData(message.guild.id)?.connection;

    connection?.destroy();
    setConnection(undefined, message.guild.id);
    setAudioPlayer(undefined, message.guild.id);

    console.log(`Me he desconectado del canal de voz en el servidor: ${message.guild.id}`);
}
