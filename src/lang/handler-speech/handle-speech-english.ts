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

export async function handleSpeechEnglish(message: VoiceMessage): Promise<void>{
    message.content = message.content!.toLowerCase();
    if(message.content.includes('hear me brown')){
    console.log("TEXT: " + message.content)

    if(message.content.includes('nuke')){
        console.log("NUKE TEXT: ")
        await kickAll(message);
        return;
    }else if(message.content.includes('kick')){

        console.log("KICK TEXT: " + message.content)
        if(message.content.includes('all')){
        await kickAll(message);
        }else{
        await kickUser(message);
        }

    }else if(message.content.includes('number') && (message.content.includes('random'))){

        console.log("NUMBER TEXT: " + message.content);
        if(connection)
        speakText('' + (Math.random() * 10).toFixed(), connection, message.guild.id);

    }else if(message.content.includes('alert')){

        console.log("ALERT TEXT: " + message.content)
        await alertUsers(message);

    }else if(message.content.includes('mute')){

        console.log("MUTE TEXT: " + message.content)
        await muteUser(message);

    }else if(message.content.includes('deaf')){

        console.log("DEAF TEXT: " + message.content)
        await deafUser(message);

    }else if(message.content.includes('speak')){

        console.log("TEXT TO UNMUTE & UNDEAF: " + message.content)
        await normalVoiceState(message);
        
    }else if(message.content.includes('go to') || message.content.includes('move')){

        console.log("MOVE CHANNEL TEXT: " + message.content)
        await moveToChannel(message);

    }else if(message.content.includes('who is connect')){

        console.log('WHO IS CONNECTED TEXT: ' + message.content);
        if(connection)
        await getConnectedUsers(message, connection);

    }else if(message.content.includes('think')){

        console.log('THINK TEXT: ' + message.content);
        if(connection)
        await askOpenAi(message.content, connection, message.guild.id);

    }
    }
}