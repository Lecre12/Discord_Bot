import { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { isDebugLogsEnabled } from '../util/debug-log';
import { safeInteractionReply } from '../util/interaction-response';
import { getVoiceStatusLines } from '../util/voice-status';

export const configPanelCommand = new SlashCommandBuilder()
  .setName('config')
  .setDescription('Abre el panel de configuracion del bot');

export function buildConfigPanel(interaction: any, includeFlags = true) {
  const debugEnabled = isDebugLogsEnabled();
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('config_status_voice')
      .setLabel('Estado voz')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('config_toggle_debug')
      .setLabel(debugEnabled ? 'Debug off' : 'Debug on')
      .setStyle(debugEnabled ? ButtonStyle.Danger : ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId('config_disconnect')
      .setLabel('Disconnect')
      .setStyle(ButtonStyle.Secondary),
  );

  const payload: any = {
    content: [
      'Panel de configuracion',
      '',
      ...getVoiceStatusLines(interaction.guild),
    ].join('\n'),
    components: [row],
  };

  if (includeFlags) {
    payload.flags = MessageFlags.Ephemeral;
  }

  return payload;
}

export async function executeConfigPanel(interaction: any): Promise<void> {
  await safeInteractionReply(interaction, buildConfigPanel(interaction));
}
