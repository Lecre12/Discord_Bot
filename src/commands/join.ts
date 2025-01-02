import { IncomingHttpHeaders } from './../../node_modules/undici-types/header.d';
import { Message, ContextMenuCommandInteraction, GuildMember, VoiceChannel, StageChannel } from './../../node_modules/discord.js/typings/index.d';
import { Client, MessageManager, SlashCommandBuilder } from 'discord.js';
import { getConfig } from '../util/bot-config';
import { AudioPlayerStatus, createAudioPlayer, createAudioResource } from '@discordjs/voice';
const { joinVoiceChannel } = require('@discordjs/voice');
import { wait } from '../util/wait';
import { aliasUsers } from '../index'

let config: any
let client: Client



export const joinCommand = new SlashCommandBuilder()
  .setName('join')
  .setDescription('Joins your channel and listens for voice commands');

export async function executeJoin(interaction: any, cl: Client) {
  client = cl
  const member = interaction.guild?.members.cache.get(interaction.user.id);
  if (member) {
    const voiceChannel = member.voice.channel;
    if (voiceChannel) {
      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
        selfDeaf: false,
      });
      config = getConfig(interaction.guildId as string)
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

export async function handleSpeechEvent(message: any){
  switch(config.LANG){
    case 'en-EN':
      break
    case 'es-ES':
      if(!message.content)return;
      message.content = message.content.toLowerCase();
      if(message.content.includes('oye marrón') || message.content.includes('oye marron')){
        console.log("TEXTO: " + message.content)
        if(message.content.includes('expulsa')){
          console.log("TEXTO DE EXPULSAR: " + message.content)
          
          Object.keys(aliasUsers).forEach((name) => {
            if (message.content.includes(name) || message.content.includes('todo')) {
              const userId = aliasUsers[name];
              message.member.voice.channel.members.forEach((m: any) => {
                if (m.id == userId || message.content.includes('todo')) {
                  m.voice.disconnect();
                }
              });
            }
          });
        }else if(message.content.includes('número') && (message.content.includes('random') || message.content.includes('aleatorio'))){
          console.log("TEXTO DE NUMERO: " + message.content)
          message.channel.send({
            content: '' + (Math.random() * 10).toFixed(),
            tts: true,
          })
        }else if(message.content.includes('alert')){
          console.log("TEXTO ALERTA: " + message.content)
          const config = getConfig(message.guild.id)
          message.member.voice.channel.members.forEach((m: any) => {
            if(m.voice.selfDeaf){
              const targetChannel1 = message.guild?.channels.cache.get(config.CHANNEL1);
              const targetChannel2 = message.guild?.channels.cache.get(config.CHANNEL2);
    
              legacyAlarmCommand(m, targetChannel1, targetChannel2, message.member.voice.channel)
            }
          });
        }else if(message.content.includes('silenc')){
          console.log("TEXTO DE SILENCIAR: " + message.content)
          
          Object.keys(aliasUsers).forEach((name) => {
            if (message.content.includes(name) || message.content.includes('todo')) {
              const userId = aliasUsers[name];
              message.member.voice.channel.members.forEach((m: any) => {
                if (m.id == userId || message.content.includes('todo')) {
                  m.voice.setMute(true);
                }
              });
            }
          });
        }else if(message.content.includes('ensord')){
          console.log("TEXTO DE ENSORDECER: " + message.content)
          
          Object.keys(aliasUsers).forEach((name) => {
            if (message.content.includes(name) || message.content.includes('todo')) {
              const userId = aliasUsers[name];
              message.member.voice.channel.members.forEach((m: any) => {
                if (m.id == userId || message.content.includes('todo')) {
                  m.voice.setDeaf(true);
                }
              });
            }
          });
        }else if(message.content.includes('habl')){
          console.log("TEXTO DE DESMUTEAR Y DESENSORDECER: " + message.content)
          
          Object.keys(aliasUsers).forEach((name) => {
            const userId = aliasUsers[name];
            message.member.voice.channel.members.forEach((m: any) => {
              m.voice.setMute(false);
              m.voice.setDeaf(false);
            });
          });
        }
      }
      break
    default:
      break
  }
}

async function legacyAlarmCommand(memberTo : GuildMember, targetChannel : VoiceChannel | StageChannel, initialChannel : VoiceChannel | StageChannel, trueInitialChannel: VoiceChannel) {
  try {
    do {
      await memberTo.voice.setChannel(targetChannel);
      await wait(600);
      await memberTo.voice.setChannel(initialChannel);
      await wait(600);
    } while (memberTo.voice.selfDeaf);
    await memberTo.voice.setChannel(trueInitialChannel);
  } catch (error) {}
}
