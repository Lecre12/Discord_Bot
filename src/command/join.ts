import { createAudioPlayer, joinVoiceChannel, VoiceConnection } from "@discordjs/voice";
import { MessageFlags, SlashCommandBuilder } from "discord.js";
import { getServerData, setAudioPlayer, setConnection } from "../util/server-data";
import { getMessage } from "../lang/lang-manager";
import { LangKeys } from "../lang/lang-keys";
import { SpeechManager } from "../voice-recognition/recognizer";
import { MODEL_PATH_STRING } from "../voice-recognition/vosk";
import { handleSpeechAi } from "../handler/speech-handler";
import { client } from "../index";
import { speechQueue } from "../voice-recognition/speech-queue";

export const joinCommand = new SlashCommandBuilder()
  .setName('join')
  .setDescription('Se une a la llamda para escuchar comandos de voz');

export async function executeJoin(interaction: any) {
    let connection: VoiceConnection | undefined;
    //interaction.guildId

    const serverData = getServerData(interaction.guildId as string);
    if(!serverData){
      await interaction.reply({ content: getMessage(LangKeys.SERVER_CONFIG_NOT_FOUND, interaction.guildId as string), flags: MessageFlags.Ephemeral });
      return;
    } 
    if(serverData?.connection){
        await interaction.reply({ content: getMessage(LangKeys.ERR_ALREADY_JOINED, interaction.guildId as string), flags: MessageFlags });
        return;
    }
    const voiceChannel = interaction.member?.voice.channel;
    if (!voiceChannel) {
        await interaction.reply({ content: getMessage(LangKeys.ERR_NOT_ON_CHANNEL, interaction.guildId as string), flags: MessageFlags.Ephemeral });
        return;
    }

    connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      selfDeaf: false,
    });
    const audioPlayer = createAudioPlayer();

    setAudioPlayer(audioPlayer, interaction.guildId as string);
    setConnection(connection, interaction.guildId as string);

    const speechManager = new SpeechManager(connection, MODEL_PATH_STRING, client);

    // Configurar el procesador de la cola para manejar los mensajes reconocidos
    speechQueue.setProcessor(async (voiceMessage) => {
        console.log(`[Cola] Procesando mensaje de ${voiceMessage.author?.username}: "${voiceMessage.content}"`);
        await handleSpeechAi(voiceMessage);
    });

    // Escuchar a todos los usuarios
    speechManager.listenAllUsers();

    await interaction.reply({ content: '¡Hola! Estoy escuchando tus comandos' });
    return connection;
}
