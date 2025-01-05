import fs from "fs";
import path from "path";
import OpenAI from "openai";
import { playAudioFile, speakText } from "./ttsUtil";
import { VoiceConnection } from "@discordjs/voice";

export async function textToSpeech(text: string, connection: VoiceConnection){
    const openai = new OpenAI();
    const speechFile = path.resolve("./speech.mp3");

    const mp3 = await openai.audio.speech.create({
    model: "tts-1",
    voice: "alloy",
    input: text,
    speed: 1.5,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    await fs.promises.writeFile(speechFile, buffer);
    playAudioFile(speechFile, connection);
}
