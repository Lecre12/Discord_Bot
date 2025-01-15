import { VoiceMessage } from "discord-speech-recognition";
import { connection } from "../commands/join";
import { askOpenAi } from "../util/open-ai-integration";
import { speakText } from "../util/ttsUtil";
import { alertUsers } from "../voice-commands/alert";
import { getConnectedUsers } from "../voice-commands/connected-users";
import { deafUser } from "../voice-commands/deaf";
import { kickAll, kickUser } from "../voice-commands/kick";
import { moveToChannel } from "../voice-commands/move-channel";
import { muteUser } from "../voice-commands/mute";
import { normalVoiceState } from "../voice-commands/unmute-undeaf";
import { getMessage } from "../lang/lang-manager";
import { LangKeys } from "../lang/lang-keys";


export async function handleSpeech(message: VoiceMessage): Promise<void>{
    if (!message || !message.content) return;
    message.content = message.content!.toLowerCase();
    if(message.content.includes(getMessage(LangKeys.ACTIVATION_VOICE_COMMAND, message.guild.id))){
    console.log("TEXT: " + message.content);

    if(message.content.includes(getMessage(LangKeys.NUKE_VOICE_COMMAND, message.guild.id))){
        console.log("NUKE TEXT: ")
        await kickAll(message);
        return;
    }else if(message.content.includes(getMessage(LangKeys.KICK_VOICE_COMMAND, message.guild.id))){

        console.log("KICK TEXT: " + message.content)
        if(message.content.includes(getMessage(LangKeys.ALL_KICK_VOICE_COMMAND, message.guild.id))){
        await kickAll(message);
        }else{
        await kickUser(message);
        }

    }else if(message.content.includes(getMessage(LangKeys.NUMBER_VOICE_COMMAND, message.guild.id)) && (message.content.includes(getMessage(LangKeys.RANDOM_VOICE_COMMAND, message.guild.id)))){

        console.log("NUMBER TEXT: " + message.content);
        if(connection)
        speakText('' + (Math.random() * 10).toFixed(), connection, message.guild.id);

    }else if(message.content.includes(getMessage(LangKeys.ALERT_VOICE_COMMAND, message.guild.id))){

        console.log("ALERT TEXT: " + message.content)
        await alertUsers(message);

    }else if(message.content.includes(getMessage(LangKeys.MUTE_VOICE_COMMAND, message.guild.id))){

        console.log("MUTE TEXT: " + message.content)
        await muteUser(message);

    }else if(message.content.includes(getMessage(LangKeys.DEAF_VOICE_COMMAND, message.guild.id))){

        console.log("DEAF TEXT: " + message.content)
        await deafUser(message);

    }else if(message.content.includes(getMessage(LangKeys.SPEAK_VOICE_COMMAND, message.guild.id))){

        console.log("TEXT TO UNMUTE & UNDEAF: " + message.content)
        await normalVoiceState(message);
        
    }else if(message.content.includes(getMessage(LangKeys.MOVE_VOICE_COMMANDV2, message.guild.id)) || message.content.includes(getMessage(LangKeys.MOVE_VOICE_COMMAND, message.guild.id))){

        console.log("MOVE CHANNEL TEXT: " + message.content)
        await moveToChannel(message);

    }else if(message.content.includes(getMessage(LangKeys.WHO_VOICE_COMMAND, message.guild.id)) && message.content.includes(getMessage(LangKeys.CONNECTED_VOICE_COMMAND, message.guild.id))){

        console.log('WHO IS CONNECTED TEXT: ' + message.content);
        if(connection)
        await getConnectedUsers(message, connection);

    }else if(message.content.includes(getMessage(LangKeys.ACTIVATION_VOICE_COMMAND, message.guild.id) + getMessage(LangKeys.THINK_VOICE_COMMAND, message.guild.id))){

        console.log('THINK TEXT: ' + message.content);
        if(connection)
        await askOpenAi(message.content, connection, message.guild.id);

    }
    }
}