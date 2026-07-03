import { MessageFlags, SlashCommandBuilder } from 'discord.js';
import { getVoiceStatusLines } from '../util/voice-status';

export const statusVoiceCommand = new SlashCommandBuilder()
  .setName('status-voice')
  .setDescription('Muestra el estado de voz y escucha del bot');

export async function executeStatusVoice(interaction: any): Promise<void> {
  await interaction.reply({
    content: getVoiceStatusLines(interaction.guild).join('\n'),
    flags: MessageFlags.Ephemeral,
  });
}
