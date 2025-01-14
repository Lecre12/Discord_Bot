import { SlashCommandBuilder, VoiceChannel } from 'discord.js';
import { getConfig } from '../util/bot-config';
const { joinVoiceChannel } = require('@discordjs/voice');
import { VoiceConnection } from '@discordjs/voice';
import { getMessage } from '../lang/lang-manager';
import { LangKeys } from '../lang/lang-keys';

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
      await interaction.reply(getMessage(LangKeys.JOIN_CHANNEL_REPLY, interaction.guildId) + `${voiceChannel.name}`);  
    } else {
      await interaction.reply(getMessage(LangKeys.ERR_NOT_ON_CHANNEL, interaction.guildId));
    }
  }
}