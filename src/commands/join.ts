import { SlashCommandBuilder } from 'discord.js';
import { getConfig } from '../util/bot-config';
const { joinVoiceChannel } = require('@discordjs/voice');
import { VoiceConnection } from '@discordjs/voice';

export let connection: VoiceConnection | undefined;
export function setConnection(con: VoiceConnection | undefined){
  connection = con;
}



export const joinCommand = new SlashCommandBuilder()
  .setName('join')
  .setDescription('Joins your channel and listens for voice commands');

export async function executeJoin(interaction: any) {
  const member = interaction.guild?.members.cache.get(interaction.user.id);
  if (member) {
    const voiceChannel = member.voice.channel;
    if (voiceChannel) {
      if(connection){
        connection.destroy()
      }
      connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
        selfDeaf: false,
      });
      const config = getConfig(interaction.guildId as string)
      switch (config.LANG){
        case 'en-EN':
          await interaction.reply(`Joined ${voiceChannel.name} and listenning to you!`);  
          break
        case 'es-ES':
            await interaction.reply(`Me he unido a ${voiceChannel.name} y estoy escuchando tus comandos de voz!`);
          break
        default:
          break
      }
    } else {
      await interaction.reply('You have to be in a channel first, cazurro');
    }
  }
}