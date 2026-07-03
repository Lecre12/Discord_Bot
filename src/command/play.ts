import { MessageFlags, SlashCommandBuilder } from 'discord.js';
import { playSong } from '../util/music';
import { getServerData } from '../util/server-data';

export const playCommand = new SlashCommandBuilder()
  .setName('play')
  .setDescription('Añade una cancion o link de YouTube a la cola')
  .addStringOption((option) =>
    option
      .setName('query')
      .setDescription('Busqueda o URL de YouTube')
      .setRequired(true),
  );

export async function executePlay(interaction: any): Promise<void> {
  const query = interaction.options.getString('query', true) as string;
  const connection = getServerData(interaction.guildId as string)?.connection;

  if (!connection) {
    await interaction.reply({ content: 'Primero usa /join en un canal de voz.', flags: MessageFlags.Ephemeral });
    return;
  }

  await interaction.reply({ content: `Añadido a la cola: ${query}`, flags: MessageFlags.Ephemeral });
  await playSong(query, interaction.guildId as string);
}
