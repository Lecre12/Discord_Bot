import { VoiceMessage } from "discord-speech-recognition";
import { kickAll, kickUser } from "../../voice-commands/kick";
import { alertUsers } from "../../voice-commands/alert";
import { muteUser } from "../../voice-commands/mute";
import { deafUser } from "../../voice-commands/deaf";
import { normalVoiceState } from "../../voice-commands/unmute-undeaf";
import { moveToChannel } from "../../voice-commands/move-channel";
import { getConnectedUsers } from "../../voice-commands/connected-users";
import { connection } from '../../commands/join'
import { speakText } from "../../util/ttsUtil";
import { askOpenAi } from "../../util/open-ai-integration";

export async function handleSpeechSpanish(message: VoiceMessage): Promise<void>{
    message.content = message.content!.toLowerCase();
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
        if(connection)
        speakText('' + (Math.random() * 10).toFixed(), connection, message.guild.id);

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
        if(connection)
        await getConnectedUsers(message, connection);

    }else if(message.content.includes('piensa')){

        console.log('TEXTO DE PENSAR: ' + message.content);
        if(connection)
        await askOpenAi(message.content, connection, message.guild.id);

    }
    }
}