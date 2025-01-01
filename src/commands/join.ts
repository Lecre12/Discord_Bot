import { SlashCommandBuilder } from 'discord.js';

export const joinCommand = new SlashCommandBuilder()
  .setName('join')
  .setDescription('Joins your channel and listens for voice commands');

export async function executeJoin(interaction: any) {
  const member = interaction.guild?.members.cache.get(interaction.user.id);
  if (member) {
    const voiceChannel = member.voice.channel;
    if (voiceChannel) {
      await voiceChannel.join();
      await interaction.reply(`Joined ${voiceChannel.name} and listenning to you!`);
    } else {
      await interaction.reply('You have to be in a channel first, cazurro');
    }
  }
}
