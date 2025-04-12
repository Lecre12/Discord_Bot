import OpenAI from "openai";

const openIa = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export const getOpenIa = () => openIa;