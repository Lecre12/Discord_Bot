import { ActivityType, Client, GatewayIntentBits, VoiceState } from 'discord.js';
import dotenv from 'dotenv';
import { EventEmitter } from 'events';
import { executeCommand, registerCommands } from './handler/command-handler';
import { addServerData, getServerData, getServersData, setAudioPlayer, setConnection, setServerSpeechOptions, startServerData } from './util/server-data';
import { disconnectOnLoad } from './util/disconnect-on-load';
import { handleSpeech, handleSpeechAi } from './handler/speech-handler';
import { handleInteraction } from './handler/interaction-handler';
import { executeJoin } from './command/join';
import { SpeechManager } from './voice-recognition/recognizer';
import { voskModel } from './voice-recognition/vosk';
import { Worker } from "worker_threads";
import path from "path";
import { VoiceMessage } from "./type/voice-message";
dotenv.config();

EventEmitter.defaultMaxListeners = 20;

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN as string


export const client = new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildPresences,
  ] });

client.once("ready", async () => {
    console.log(`Logged in as ${client.user?.tag}!`);
    client.user?.setActivity('Voice Commands', { type: ActivityType.Listening });
    disconnectOnLoad(client);
    await registerCommands();
    startServerData();

    client.guilds.cache.forEach(async guild => {
        const lang = getServerData(guild.id)?.lang;
        if(lang){
            const speechOptions : any = null;
            setServerSpeechOptions(speechOptions, guild.id);
            //console.log(`Config for this guild ${guild.id}:`, getServerData(guild.id));
        }else {
            const speechOptions : any = null;
            addServerData(guild.id, {}, {}, false, 'es-ES', speechOptions, undefined, undefined, undefined);
        }
    });
    
});

client.on('interactionCreate', async (interaction: any) => {
    if(!interaction.guild){
      interaction.reply('This command can only be used in a server');
      return;
    }
  
    if (interaction.isCommand()){
        executeCommand(interaction, interaction.commandName);
    }else{
        handleInteraction(interaction);
    }
});

// client.on("guildCreate", (guild) => {
//     const speechOptions : SpeechOptions = addSpeechEvent(client);
//     speechOptions.lang = 'es-ES';
//     speechOptions.profanityFilter = false;
//     addServerData(guild.id, {}, {}, false, 'es-ES', speechOptions, undefined, undefined);
// });


client.on('voiceStateUpdate', async (oldState: VoiceState, newState: VoiceState) => {
    const botMember = await newState.guild.members.fetch(client.user!.id);
	  const guildMember = await newState.guild.members.fetch(newState.member!.id);
	  const botId = client.user?.id;
    const botVoiceChannel = botMember.voice.channel?.id;
    
    // Log de debug para rastrear eventos
    console.log(`[DEBUG] voiceStateUpdate: ${newState.member?.user.tag} | OldChannel: ${oldState.channelId} | NewChannel: ${newState.channelId} | BotInChannel: ${botVoiceChannel}`);

	//Gestion cuando el bot se desconecta
	if (oldState.member?.user.id === botId) {
		const wasInChannel = oldState.channelId;
		const isInChannel = newState.channelId;
	
		if (wasInChannel && !isInChannel) {
			console.log('🔌 El bot se ha desconectado del canal de voz.');
			setConnection(undefined, oldState.guild.id);
			setAudioPlayer(undefined, oldState.guild.id);
		}
		return;
	}

    // Verificar si el miembro que se ha unido es alguien que no es el bot
    // Activar auto-join en cualquier actualización de voz, pero solo si hay usuarios en el canal
    if (newState.channel && newState.member?.id !== client.user?.id && !botVoiceChannel && getServerData(oldState.guild.id)?.auto_connect) {
		// Verificar que hay usuarios reales en el canal antes de conectar
		const membersInChannel = newState.channel.members.filter(member => !member.user.bot);
		// Solo conectar si hay usuarios reales actualmente en el canal
		if (membersInChannel.size > 0) {
			// Simular la ejecución del comando /join
      console.log('🤖 Auto-join activado: usuarios reales detectados en el canal', membersInChannel);
			const interaction = {
				guildId: newState.guild.id,
				user: { id: newState.member?.id },
				member: guildMember,
				guild: newState.guild,
				reply: async (message: string) => console.log('Reply:', message),
			};

			executeJoin(interaction);
		} else {
			console.log('🚫 Auto-join cancelado: no hay usuarios reales en el canal');
		}
    }

    // Verificar si el bot está solo en el canal de voz y si es asi desconectarlo
    if (oldState.channel) {
		const channel = oldState.channel;
		const botMember = channel.guild.members.me;
		if(channel.members.has(oldState.client.user!.id)){
			const membersInChannel = channel.members.filter(member => !member.user.bot);
			if (membersInChannel.size === 0) {
				// Destruir la conexión para evitar reconexión automática
				const serverData = getServerData(oldState.guild.id);
				if (serverData?.connection) {
					serverData.connection.destroy();
					console.log(`🔌 Destruyendo conexión porque no hay usuarios en ${channel.name}`);
				}
				await botMember?.voice.disconnect();
				console.log(`Me he desconectado del canal: ${channel.name} porque no hay más usuarios.`);
			}
		}
	}

  if (!oldState.channel && newState.channel) {
    // Nuevo usuario entró
    console.log(`${newState.member?.user.tag} se unió al canal ${newState.channel.name}`);

    // Opcional: si quieres empezar a escucharlo
    const serverData = getServerData(newState.guild.id);
    if (serverData?.connection) {
      serverData.speechManager?.listenUser(newState.member?.id!);
    }
  }
});
// client.on('speech', async (message: VoiceMessage) => {
//   if (!message.content || message.content.trim() === '') return;
//   try {
//     await handleSpeechAi(message);
//   } catch (err) {
//     console.warn('Error procesando audio:', err);
//   }
// });


client.login(BOT_TOKEN);