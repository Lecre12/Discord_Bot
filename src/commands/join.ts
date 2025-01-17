import { SlashCommandBuilder, VoiceChannel } from 'discord.js';
const { joinVoiceChannel } = require('@discordjs/voice');
import { VoiceConnection, VoiceConnectionStatus } from '@discordjs/voice';
import { getMessage } from '../lang/lang-manager';
import { LangKeys } from '../lang/lang-keys';
import { semUpdateStatus } from '..';

export let connection: VoiceConnection | undefined;
export function setConnection(con: VoiceConnection | undefined){
  connection = con;
}



export const joinCommand = new SlashCommandBuilder()
  .setName('join')
  .setDescription('Joins your channel and listens for voice commands');

export async function executeJoin(interaction: any) {
  await semUpdateStatus.acquire();

  if(connection) return;
  const member = interaction.guild?.members.cache.get(interaction.user.id);
  if (member) {
    const voiceChannel = member.voice.channel;
    if (voiceChannel) {
      connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
        selfDeaf: false,
      });
      console.log("Connection created: " + connection?.state.status)
      connection?.on(VoiceConnectionStatus.Disconnected, async () =>{
        connection?.destroy();
        connection = undefined;
        console.log("Connection destroyed.");
      });
      connection?.on(VoiceConnectionStatus.Ready, () => {
        console.log("Connection ready: " + connection?.state.status);
        semUpdateStatus.release()
      });
      connection?.on('error', (error) => {
        console.log("Connection error: " + error);
      });
      await interaction.reply(getMessage(LangKeys.JOIN_CHANNEL_REPLY, interaction.guildId) + `${voiceChannel.name}`);  
    } else {
      await interaction.reply(getMessage(LangKeys.ERR_NOT_ON_CHANNEL, interaction.guildId));
    }
  }else{
    semUpdateStatus.release();
  }
}