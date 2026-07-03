import { SlashCommandBuilder } from "discord.js";
import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { STATIC_AUDIO_DIR } from "../constant/paths";

export const addCustomAudioCommand = new SlashCommandBuilder()
  .setName("add-custom-audio")
  .setDescription("Añade un audio personalizado")
  .addStringOption((option) =>
    option
      .setName("nombre")
      .setDescription("Alias del audio")
      .setRequired(true)
  );


  export async function executeAddCustomAudio(interaction: any) {
    const customAudioName = interaction.options.getString("nombre", true) as string;
  
    await interaction.reply({
      content: "Por favor, sube un archivo `.mp3`",
      ephemeral: true,
    });
  
    const filter = (m: any) =>
      m.author.id === interaction.user.id &&
      m.attachments.size > 0 &&
      [...m.attachments.values()][0].name?.endsWith(".mp3");
  
    try {
      const channel = await interaction.channel?.fetch();
      const collected = await channel.awaitMessages({
        filter,
        max: 1,
        time: 30000,
        errors: ["time"],
      });
  
      const messageWithAttachment = collected.first();
      const attachment = messageWithAttachment?.attachments.first();
  
      if (!attachment) {
        await interaction.followUp({
          content: "No se recibió ningún archivo .mp3 válido.",
          ephemeral: true,
        });
        return;
      }
  
      const fileUrl = attachment.url;
      const filePath = path.join(STATIC_AUDIO_DIR, `${customAudioName.toLowerCase()}-${interaction.guildId}.mp3`);
      const folderPath = STATIC_AUDIO_DIR;
  
      // Asegúrate de que la carpeta audios existe
      fs.mkdirSync(folderPath, { recursive: true });
  
      // Descarga y guarda el archivo
      const response = await fetch(fileUrl);
      const buffer = await response.buffer();
      fs.writeFileSync(filePath, buffer);

  
      await interaction.followUp({
        content: `Audio "${customAudioName.toLowerCase()}" guardado correctamente en el servidor.`,
        ephemeral: true,
      });
    } catch (err) {
      console.error(err);
      await interaction.followUp({
        content: "Se acabó el tiempo o ocurrió un error al procesar el archivo.",
        ephemeral: true,
      });
    }
  }
