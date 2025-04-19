import { getOpenIa } from "../util/open-ia";
import { speakText } from "../util/tts";

const openIa = getOpenIa();
const messageHistory = new Map<string, { role: "user" | "assistant", content: string }[]>();

export async function askOpenAi(promtToChat: string, guildId: string) {
    try {
        if (!promtToChat) {
            console.error("El mensaje es vacío o nulo.");
            return;
        }
        promtToChat = promtToChat + "\nPor favor, responde sin ningún formato como negritas, cursivas o títulos. Solo texto plano. De manera escueta.";

        speakText("Te he entendido, espera que piense", guildId);

        const history = messageHistory.get(guildId) || [];
        history.push({ role: 'user', content: promtToChat });

        if (history.length > 10) {
            history.shift();
        }

        const response = await openIa.chat.completions.create({
            model: 'gpt-4.1',
            messages: [
                ...history,
                { role: 'user', content: promtToChat }
            ],
            n: 1,
            max_tokens: 500,
        });

        console.log("IA responde: " + response.choices[0].message.content);

        const aiResponse = response.choices[0].message.content;
        if (aiResponse) {
            history.push({ role: 'assistant', content: aiResponse });

            if (history.length > 10) {
                history.shift();
            }

            messageHistory.set(guildId, history);
            await speakText(aiResponse, guildId);
        } else {
            console.error("La respuesta de la IA es nula.");
            speakText("No pude obtener una respuesta válida de la IA.", guildId);
        }

    } catch (err) {
        console.error("Error al obtener la respuesta de la IA: " + err);
        speakText("He tenido un error al preguntarle a la IA, disculpe las molestias", guildId);
    }
}