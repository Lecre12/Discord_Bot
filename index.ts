import { Client, GatewayIntentBits } from 'discord.js';
const { addSpeechEvent } = require("discord-speech-recognition");

import dotenv from 'dotenv';
dotenv.config();

export const token = process.env.DISCORD_BOT_TOKEN as string;