import { GuildMember, VoiceChannel, StageChannel } from './../../node_modules/discord.js/typings/index.d';
import { Client, SlashCommandBuilder, PresenceUpdateStatus } from 'discord.js';
import { getConfig } from '../util/bot-config';
const { joinVoiceChannel } = require('@discordjs/voice');
import { wait } from '../util/wait';
import { setCanDisconnect, serverData, sem, openIa } from '../index'
import { speakText } from '../util/ttsUtil';
import { VoiceConnection } from '@discordjs/voice';
import { textToSpeech } from '../util/ttsOpenIa';

let config: any
let client: Client
let connection: VoiceConnection



export const joinCommand = new SlashCommandBuilder()
  .setName('join')
  .setDescription('Joins your channel and listens for voice commands');

export async function executeJoin(interaction: any, cl: Client) {
  client = cl
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
      const aliasUsers = serverData.get(message.guild.id)?.aliasUsers;
      const moveChannels = serverData.get(message.guild.id)?.moveChannels;
      if(!message.content)return;
      message.content = message.content.toLowerCase();
      if(message.content.includes('oye marrón') || message.content.includes('oye marron')){
        console.log("TEXTO: " + message.content)

        if(message.content.includes('nuke')){
          const membersCopy: GuildMember[] = Array.from(message.member.voice.channel.members.values()).slice() as GuildMember[];
          membersCopy.forEach(async (m: GuildMember) => {
            await m.voice.disconnect();
            console.log(`Expulsado ${m.displayName}`)
          });
          return;
        }else if(message.content.includes('expulsa')){
          console.log("TEXTO DE EXPULSAR: " + message.content)
          if(message.content.includes('todo')){
            setCanDisconnect(false)
            const membersCopy: GuildMember[] = Array.from(message.member.voice.channel.members.values()).slice() as GuildMember[];
            membersCopy.forEach(async (m: GuildMember) => {
              await m.voice.disconnect();
              console.log(`Expulsado ${m.displayName}`)
            });
            //await wait(1000)
            setCanDisconnect(true)
            return;
          }
          if(aliasUsers){
            Object.keys(aliasUsers).forEach((name) => {
              if (message.content.includes(name)) {
                const userId = aliasUsers[name];
                const membersCopy: GuildMember[] = Array.from(message.member.voice.channel.members.values()).slice() as GuildMember[];
                membersCopy.forEach(async (m: GuildMember) => {
                  if (m.id == userId && m.voice.channel) {
                    await m.voice.disconnect();
                  }
                });
              }
            });
          }
        }else if(message.content.includes('número') && (message.content.includes('random') || message.content.includes('aleatorio'))){
          console.log("TEXTO DE NUMERO: " + message.content);
          speakText('' + (Math.random() * 10).toFixed(), connection)
          /*message.channel.send({
            content: '' + (Math.random() * 10).toFixed(),
            tts: true,
          })*/
        }else if(message.content.includes('alert')){
          console.log("TEXTO ALERTA: " + message.content)
          const config = getConfig(message.guild.id)
          const membersCopy: GuildMember[] = Array.from(message.member.voice.channel.members.values()).slice() as GuildMember[];
          membersCopy.forEach((m: GuildMember) => {
            if(m.voice.selfDeaf || m.voice.serverDeaf){
              const targetChannel1 = message.guild?.channels.cache.get(config.CHANNEL1);
              const targetChannel2 = message.guild?.channels.cache.get(config.CHANNEL2);
    
              legacyAlarmCommand(m, targetChannel1, targetChannel2, message.member.voice.channel)
            }
          });
        }else if(message.content.includes('silenc')){
          console.log("TEXTO DE SILENCIAR: " + message.content)
          if(aliasUsers)
          Object.keys(aliasUsers).forEach((name) => {
            if (message.content.includes(name)) {
              const userId = aliasUsers[name];
              const membersCopy: GuildMember[] = Array.from(message.member.voice.channel.members.values()).slice() as GuildMember[];
              membersCopy.forEach((m: any) => {
                if (m.id == userId) {
                  m.voice.setMute(true);
                }
              });
            }
          });
        }else if(message.content.includes('ensord')){
          console.log("TEXTO DE ENSORDECER: " + message.content)
          if(aliasUsers)
          Object.keys(aliasUsers).forEach((name) => {
            if (message.content.includes(name)) {
              const userId = aliasUsers[name];
              const membersCopy: GuildMember[] = Array.from(message.member.voice.channel.members.values()).slice() as GuildMember[];
              membersCopy.forEach((m: any) => {
                if (m.id == userId) {
                  m.voice.setDeaf(true);
                }
              });
            }
          });
        }else if(message.content.includes('habl')){
          console.log("TEXTO DE DESMUTEAR Y DESENSORDECER: " + message.content)
          if(aliasUsers)
          Object.keys(aliasUsers).forEach((name) => {
            const membersCopy: GuildMember[] = Array.from(message.member.voice.channel.members.values()).slice() as GuildMember[];
            membersCopy.forEach((m: any) => {
              m.voice.setMute(false);
              m.voice.setDeaf(false);
            });
          });
        }else if(message.content.includes('muev') || message.content.includes('move')){
          console.log("TEXTO DE MOVER: " + message.content)
          await sem.acquire()
          setCanDisconnect(false);
          if(moveChannels)
          Object.keys(moveChannels).forEach((name) => {
            if (message.content.includes(name)) {
              const channelId = moveChannels[name];
              console.log(channelId)
              const targetChannel = message.guild?.channels.cache.get(channelId);
              const membersCopy: GuildMember[] = Array.from(message.member.voice.channel.members.values()).slice() as GuildMember[];
              membersCopy.forEach(async (m: any) => {
                try{
                  await m.voice.setChannel(targetChannel);
                }catch(error){}
              });
            }
          });
          
          sem.release();
          await wait(1000)
          await sem.acquire()
          setCanDisconnect(true);
          sem.release()
        }else if(message.content.includes('conect') && (message.content.includes('quién') || message.content.includes('quien'))){
          console.log('TEXTO DE CONECTADO: ' + message.content);
          if(aliasUsers){
            const uniqueKeys = new Set<string>();
            Object.entries(aliasUsers).forEach(([key, value]) => {
              if (!uniqueKeys.has(value) && key != 'chip') {
                uniqueKeys.add(value);
                //console.log(`Procesando clave única: ${key} con valor: ${value}`);
                // Realizar aquí las acciones que necesites para claves únicas
              }
            });

            const onlineUsersNames: string[] = [];
            const onlineMember: GuildMember[] = [];
            const guild = await client.guilds.fetch('736543433581133856');
            if (!guild) {
              console.log('No se encontró el servidor.');
              return ;
            }

            guild.members.cache.forEach(member => {
              //console.log(member.displayName)
              // Verificar si el miembro está en uniqueKeys y si está en línea
              if (uniqueKeys.has(member.id) && 
              (member.presence?.status === PresenceUpdateStatus.Online || member.presence?.status === PresenceUpdateStatus.Idle || member.presence?.status === PresenceUpdateStatus.DoNotDisturb) &&
              !member.voice.channel) {
                onlineUsersNames.push(member.user.username);
                onlineMember.push(member);
              }
            });

            let textOnlineUsers : string = "Estan conectados: ";
            //console.log(onlineUsers);
            onlineUsersNames.forEach(name =>{
              textOnlineUsers = textOnlineUsers.concat(", " + name);
            })
            speakText(textOnlineUsers, connection);

            if(message.content.includes('voz') || message.content.includes('discord')){
              onlineMember.forEach(member => {
                //console.log("Mando msgs");
                member.send("Metase a dicol mamaguebo");
              });
            }
          }
        }else if(message.content.includes('piensa')){
          console.log('TEXTO DE PENSAR: ' + message.content);
          try{
            const response = await openIa.chat.completions.create({
              model: 'gpt-4o-mini',  // O usa el modelo que prefieras
              messages: [{ role: 'user', content: message.content }],
              n: 2,
              max_tokens: 140,
            });
            console.log("IA responde: " + response.choices[0].message.content)

            if(response.choices[0].message.content){
              speakText(response.choices[0].message.content, connection);
            }
            
          }catch(err){
            console.error("Error al obtener la respuesta de la IA: " + err)
          }
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
    } while (memberTo.voice.selfDeaf || memberTo.voice.serverDeaf);
    await memberTo.voice.setChannel(trueInitialChannel);
  } catch (error) {}
}