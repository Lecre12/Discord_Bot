import { MessageFlags, SlashCommandBuilder } from 'discord.js';
import { LangKeys } from '../lang/lang-keys';
import { getMessage } from '../lang/lang-manager';

export const helpCommand = new SlashCommandBuilder()
  .setName('help')
  .setDescription('Muestra ayuda');

export async function executeHelp(interaction: any) {
  interaction.reply({ content: "1. " + getMessage(LangKeys.HELP_DESCRIPTION, interaction.guildId) +
    "2. " + getMessage(LangKeys.CONFIG_DESCRIPTION, interaction.guildId) +
    "3. " + getMessage(LangKeys.JOIN_DESCRIPTION, interaction.guildId) +
    "4. " + getMessage(LangKeys.ADD_MEMBER_DESCRIPTION, interaction.guildId) +
    "5. " + getMessage(LangKeys.ADD_CHANNEL_DESCRIPTION, interaction.guildId) +
    "6. " + getMessage(LangKeys.REMOVE_USER_DESCRIPTION, interaction.guildId) +
    "7. " + getMessage(LangKeys.REMOVE_CHANNEL_DESCRIPTION, interaction.guildId) +
    "\n" +
    "VOICE COMMANDS:\n" +
    "1. " + getMessage(LangKeys.KICK_DESCRIPTION, interaction.guildId) +
    "2. " + getMessage(LangKeys.ALERT_DESCRIPTION, interaction.guildId) +
    "3. " + getMessage(LangKeys.RANDOM_NUMBER_DESCRIPTION, interaction.guildId) +
    "4. " + getMessage(LangKeys.MUTE_DESCRIPTION, interaction.guildId) +
    "5. " + getMessage(LangKeys.DEAF_DESCRIPTION, interaction.guildId) + 
    "6. " + getMessage(LangKeys.SPEAK_DESCRIPTION, interaction.guildId) +
    "7. " + getMessage(LangKeys.MOVE_DESCRIPTION, interaction.guildId) +
    "8. " + getMessage(LangKeys.WHO_CONNECTED_DESCRIPTION, interaction.guildId) +
    "9. " + getMessage(LangKeys.THINK_DESCRIPTION, interaction.guildId) + 
    "10. " + getMessage(LangKeys.MUSIC_DESCRIPTION, interaction.guildId) +
    "11. " + getMessage(LangKeys.STOP_ALL_AUDIO, interaction.guildId) +
    "12. " + getMessage(LangKeys.DISCONNECT_DESCRIPTION, interaction.guildId) +
    "13. " + getMessage(LangKeys.DELETE_SONG_LIST_DESCRIPTION, interaction.guildId) +
    "14. " + getMessage(LangKeys.NEXT_SONG_DESCRIPTION, interaction.guildId) +
    "15. " + getMessage(LangKeys.RUSSIAN_ROULETTE_DESCRIPTION, interaction.guildId) +
    "16. " + getMessage(LangKeys.SHOOT_RANDOM_DESCRIPTION, interaction.guildId)
    , flags: MessageFlags.Ephemeral})
    
}
