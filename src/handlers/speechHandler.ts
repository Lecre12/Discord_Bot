import { VoiceMessage } from "discord-speech-recognition";
import { serverData } from "..";
import { handleSpeechEnglish } from "../lang/handler-speech/handle-speech-english";
import { handleSpeechSpanish } from "../lang/handler-speech/handle-speech-spanish";

const languageSupportedHandlers: Record<string, (message: VoiceMessage) => Promise<void>> = {
  'en-EN': handleSpeechEnglish,
  'es-ES': handleSpeechSpanish,
};

export async function handleSpeechEvent(message: VoiceMessage){
  if (!message || !message.content) return;

  const handler = languageSupportedHandlers[serverData.get(message.guild.id)!.lang];

  if(handler){
    await handler(message);
  }else{
    console.log("Idioma no soportado: " + serverData.get(message.guild.id)!.lang);
  }

}