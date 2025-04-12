import { createAudioPlayer, joinVoiceChannel, VoiceConnection } from "@discordjs/voice";
import { MessageFlags, SlashCommandBuilder } from "discord.js";
import { getServerData, setAudioPlayer, setConnection } from "../util/server-data";

export const joinCommand = new SlashCommandBuilder()
  .setName('join')
  .setDescription('Joins your channel and listens for voice commands');

export async function executeJoin(interaction: any) {
    let connection: VoiceConnection | undefined;
    //interaction.guildId

    const serverData = getServerData(interaction.guildId as string);
    if(!serverData){
      await interaction.reply({ content: 'No se encontró la configuración del servidor', flags: MessageFlags.Ephemeral });
      return;
    } 
    if(serverData?.connection){
        await interaction.reply({ content: 'Ya estoy conectado a un canal de voz', flags: MessageFlags });
        return;
    }
    const voiceChannel = interaction.member?.voice.channel;
    if (!voiceChannel) {
        await interaction.reply({ content: 'Debes estar en un canal de voz', flags: MessageFlags.Ephemeral });
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
    await interaction.reply({ content: '¡Hola! Estoy escuchando tus comandos' });
}
