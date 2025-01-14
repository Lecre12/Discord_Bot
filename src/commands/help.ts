import { MessageFlags, SlashCommandBuilder } from 'discord.js';

export const helpCommand = new SlashCommandBuilder()
  .setName('help')
  .setDescription('Show help');

export async function executeHelp(interaction: any) {
  interaction.reply({ content: "1. /help -> muestra este mensaje\n" +
    "2. /configuration -> Configura las propiedades del bot (admin requerido)\n" +
    "3. /join -> se mete al canal de voz y empieza a escuchar comandos de voz\n" +
    "4. /addmember -> añade un usuario con un alias para que el bot lo reconozca (admin requerido)\n" +
    "5. /addchannel -> añade un canal para que el bot lo reconozca con un alias (admin requerido)\n" +
    "6. /supruserdata -> elimina todos los datos relacionados con los alias de usuarios\n" +
    "7. /suprchanneldata -> elimina todos los datos relacionados con los alias de canales\n" + 
    "" +
    "VOICE COMMANDS:\n" +
    "1. 'oye marrón expulsa + alias usuario' (o 'todos')\n" +
    "2. 'oye marrón alerta'\n" +
    "3. 'oye marrón numero aleatorio/random'\n" +
    "4. 'oye marrón silencia + alias usuario'\n" +
    "5. 'oye marron ensordece + alias usuario'\n" + 
    "6. 'oye marrón habla' -> desmutea y desensordece a todos los usuarios del canal\n" +
    "7. 'oye marrón mueve/mover + alias canal destino\n" +
    "8. 'oye marron quien esta conectado -> cita los miembros conectados y si se dice voz/discord tambien les manda un mensaje diciendoles que se metan a voz\n" +
    "9. 'oye marrón piensa promt' -> pregunta a chatgpt algo", flags: MessageFlags.Ephemeral})
}