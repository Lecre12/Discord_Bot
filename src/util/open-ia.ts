import OpenAI from "openai";
import { voiceCommandsList } from "../constant/voice-commands-list";

const openIa = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export const getOpenIa = () => openIa;

export async function clasificateSpeech(speech: string): Promise<{option: string, confidence: number}>
{
    const response = await openIa.chat.completions.create({
        model: "gpt-4.1-nano-2025-04-14",
        messages: [
            {
                role: "system",
                content: `Eres un clasificador de comandos para un bot de Discord.
                Solo debes interpretar comandos en español.
                Tienes que clasificar el siguiente texto en una de las siguientes opciones:
                ${voiceCommandsList.join(", ")}. Si no encuentras ninguna accion adecuada, devuelve "none".
                Devuelve la opcion y un nivel de confianza entre 0 y 1 en formato JSON.
                {"option": "nombre_de_la_opcion", "confidence": nivel_de_confianza}`
            },
            {
                role: "user",
                content: `Clasifica el siguiente texto: "${speech}"`
            }
        ],
        temperature: 0.2,
        max_tokens: 100,
    });

    const message = response.choices[0].message?.content || '';
    try {
        const parsed = JSON.parse(message);
        return {
            option: parsed.option,
            confidence: parsed.confidence
        };
    } catch (error) {
        return {
            option: "none",
            confidence: 0
        };
    }
}
