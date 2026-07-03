import { MessageFlags, SlashCommandBuilder } from 'discord.js';
import { isDebugLogsEnabled, setDebugLogsEnabled, toggleDebugLogs } from '../util/debug-log';

export const debugCommand = new SlashCommandBuilder()
  .setName('debug')
  .setDescription('Activa o desactiva los logs de debug')
  .addStringOption((option) =>
    option
      .setName('estado')
      .setDescription('Estado de los logs')
      .addChoices(
        { name: 'on', value: 'on' },
        { name: 'off', value: 'off' },
        { name: 'toggle', value: 'toggle' },
      )
      .setRequired(true),
  );

export async function executeDebug(interaction: any): Promise<void> {
  const state = interaction.options.getString('estado', true) as string;

  if (state === 'toggle') {
    toggleDebugLogs();
  } else {
    setDebugLogsEnabled(state === 'on');
  }

  await interaction.reply({
    content: `Debug logs: ${isDebugLogsEnabled() ? 'on' : 'off'}`,
    flags: MessageFlags.Ephemeral,
  });
}
