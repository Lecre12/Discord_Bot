import { getConfig } from "../util/bot-config";
import { setCanDisconnect, serverData, sem, openIa, client } from '../index'
import { GuildMember, PresenceUpdateStatus } from "discord.js";
import { connection } from '../commands/join'
import { speakText } from "../util/ttsUtil";
import { askOpenAi } from "../util/open-ai-integration";
import { VoiceMessage } from "discord-speech-recognition";
import { kickAll, kickUser } from "../voice-commands/kick";
import { alertUsers } from "../voice-commands/alert";
import { muteUser } from "../voice-commands/mute";
import { deafUser } from "../voice-commands/deaf";
import { normalVoiceState } from "../voice-commands/unmute-undeaf";
import { moveToChannel } from "../voice-commands/move-channel";
import { getConnectedUsers } from "../voice-commands/connected-users";

export async function handleSpeechEvent(message: VoiceMessage){
const config = getConfig(message.guild.id as string)
  switch(config.LANG){
    case 'en-EN':
      break
    case 'es-ES':
      if(!message.content || !message)return;
      message.content = message.content.toLowerCase();
      if(message.content.includes('oye marrón') || message.content.includes('oye marron')){
        console.log("TEXTO: " + message.content)

        if(message.content.includes('nuke')){
          await kickAll(message);
          return;
        }else if(message.content.includes('expulsa')){

          console.log("TEXTO DE EXPULSAR: " + message.content)
          if(message.content.includes('todo')){
            await kickAll(message);
          }else{
            await kickUser(message);
          }

        }else if(message.content.includes('número') && (message.content.includes('random') || message.content.includes('aleatorio'))){

          console.log("TEXTO DE NUMERO: " + message.content);
          speakText('' + (Math.random() * 10).toFixed(), connection)

        }else if(message.content.includes('alert')){

          console.log("TEXTO ALERTA: " + message.content)
          await alertUsers(message);

        }else if(message.content.includes('silenc') || message.content.includes('mute')){

          console.log("TEXTO DE SILENCIAR: " + message.content)
          await muteUser(message);

        }else if(message.content.includes('ensorde')){

          console.log("TEXTO DE ENSORDECER: " + message.content)
          await deafUser(message);

        }else if(message.content.includes('habl')){

          console.log("TEXTO DE DESMUTEAR Y DESENSORDECER: " + message.content)
          await normalVoiceState(message);
          
        }else if(message.content.includes('muev') || message.content.includes('move')){

          console.log("TEXTO DE MOVER: " + message.content)
          await moveToChannel(message);

        }else if(message.content.includes('conect') && (message.content.includes('quién') || message.content.includes('quien'))){

          console.log('TEXTO DE CONECTADO: ' + message.content);
          await getConnectedUsers(message, connection);

          /*if(message.content.includes('voz') || message.content.includes('discord')){
              onlineMember.forEach(member => {
                //console.log("Mando msgs");
                member.send("Metase a dicol mamaguebo");
              });
            }
          }*/
        }else if(message.content.includes('piensa')){

          console.log('TEXTO DE PENSAR: ' + message.content);
          await askOpenAi(message.content, connection);

        }
      }
      break
    default:
      break
  }
}