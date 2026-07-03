import { MessageFlags } from 'discord.js';
import { debugLog } from './debug-log';

export async function safeInteractionReply(interaction: any, payload: any): Promise<void> {
  try {
    if (interaction.deferred && interaction.editReply) {
      const { flags, ephemeral, ...editPayload } = payload;
      await interaction.editReply(editPayload);
      return;
    }

    if (interaction.replied && interaction.followUp) {
      await interaction.followUp(payload);
      return;
    }

    await interaction.reply(payload);
  } catch (error: any) {
    if (error?.code === 10062 || error?.code === 40060) {
      debugLog(`[Interaction] Respuesta ignorada: ${error.message}`);
      return;
    }

    throw error;
  }
}

export function ephemeralPayload(content: string): { content: string; flags: MessageFlags } {
  return { content, flags: MessageFlags.Ephemeral };
}
