import fs from "fs";
import path from "path";
import { playAudioFile, speakText } from "./ttsUtil";
import { VoiceConnection } from "@discordjs/voice";
import { openIa } from "../index"

export async function textToSpeech(text: string, connection: VoiceConnection){
    
    const speechFile = path.resolve("./speech.mp3");

    const mp3 = await openIa.audio.speech.create({
    model: "tts-1",
    voice: "nova",
    input: text,
    speed: 1.5,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    await fs.promises.writeFile(speechFile, buffer);

    await playAudioFile(speechFile, connection);
    //playAudioFile(speechFile, connection);
}

export async function askOpenAi(promt: string, connection: VoiceConnection, guildId: string){
    try{
        const response = await openIa.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: promt }],
            n: 1,
            max_tokens: 500,
        });
        console.log("IA responde: " + response.choices[0].message.content);

        if(response.choices[0].message.content){
            //textToSpeech(response.choices[0].message.content, connection);
            speakText(response.choices[0].message.content, connection, guildId);
        }
    }catch(err){
        console.error("Error al obtener la respuesta de la IA: " + err);
        speakText("He tenido un error al peguntarle a la ia, disculpe las molestias", connection, guildId);
    }
}
