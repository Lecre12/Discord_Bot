import { getVoiceConnection } from '@discordjs/voice';
import { MessageFlags, SlashCommandBuilder } from 'discord.js';
import { setAudioPlayer, setConnection } from '../util/server-data';

export const disconnectCommand = new SlashCommandBuilder()
  .setName('disconnect')
  .setDescription('Saca al bot del canal de voz');

export async function executeDisconnect(interaction: any): Promise<void> {
  const guildId = interaction.guildId as string;
  const connection = getVoiceConnection(guildId);

  setAudioPlayer(undefined, guildId);
  setConnection(undefined, guildId);

  if (!connection || connection.state.status === 'destroyed') {
    await interaction.reply({ content: 'No estoy conectado a ningún canal de voz.', flags: MessageFlags.Ephemeral });
    return;
  }

  connection.destroy();
  await interaction.reply({ content: 'Me he desconectado del canal de voz.', flags: MessageFlags.Ephemeral });
}
