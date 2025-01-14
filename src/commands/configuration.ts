import { SlashCommandBuilder } from 'discord.js';
import { serverData } from '../index'
import { globalConfigMenuSpanish } from '../lang/configuration-menu/global-config-spanish';
import { globalConfigMenuEnglish } from '../lang/configuration-menu/global-config-english';
import { handleInteractionEnglish } from '../lang/handler-interaction/handle-interaction-english';
import { handleInteractionSpanish } from '../lang/handler-interaction/handle-interaction-spanish';

let context: HandlerContext = {
  selectedLanguage :  '',
  selectedChannel1 :  '',
  selectedChannel2 :  '',
  selectedMoveChannel : '',
  initialConnectCheckBox :'',
  userId :''
}

const languageSupportedGlobalMenuHandlers: Record<string, (interaction: any) => Promise<void>> = {
  'en-EN': globalConfigMenuEnglish,
  'es-ES': globalConfigMenuSpanish,
};
const languageSupportedInteractionHandlers: Record<string, (interaction: any, handlerContext: HandlerContext) => Promise<void>> = {
  'en-EN': handleInteractionEnglish,
  'es-ES': handleInteractionSpanish,
};

export const configurationCommand = new SlashCommandBuilder()
  .setName('configuration')
  .setDescription('Opens the bot configuration');

export async function executeGlobalConfiguration(interaction: any) {
  const handler = languageSupportedGlobalMenuHandlers[serverData.get(interaction.guildId)!.lang];

  if(handler){
    await handler(interaction);
  }else{
    console.log("Idioma no soportado: " + serverData.get(interaction.guildId)!.lang);
  }
}

export async function handleInteraction(interaction: any) {
  const handler = languageSupportedInteractionHandlers[serverData.get(interaction.guildId)!.lang];

  if(handler){
    await handler(interaction, context);
  }else{
    console.log("Idioma no soportado: " + serverData.get(interaction.guildId)!.lang);
  }
}
