import { ActivityType, Client, GatewayIntentBits, VoiceState } from 'discord.js';
import dotenv from 'dotenv';
import { EventEmitter } from 'events';
import { executeCommand, registerCommands } from './handler/command-handler';
import { addServerData, getServerData, getServersData, setAudioPlayer, setConnection, setServerSpeechOptions, startServerData } from './util/server-data';
import { addSpeechEvent, SpeechOptions } from 'discord-speech-recognition';
import { disconnectOnLoad } from './util/disconnect-on-load';
import { handleSpeech } from './handler/speech-handler';
import { handleInteraction } from './handler/interaction-handler';
import { executeJoin } from './command/join';
import { speakText } from './util/tts';
import { wait } from './util/wait';
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
            const speechOptions : SpeechOptions = addSpeechEvent(client);
            speechOptions.lang = lang;
            speechOptions.profanityFilter = false;
            setServerSpeechOptions(speechOptions, guild.id);
            //console.log(`Config for this guild ${guild.id}:`, getServerData(guild.id));
        }else {
            const speechOptions : SpeechOptions = addSpeechEvent(client);
            speechOptions.lang = 'es-ES';
            speechOptions.profanityFilter = false;
            addServerData(guild.id, {}, {}, false, 'es-ES', speechOptions, undefined, undefined);
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

client.on("guildCreate", (guild) => {
    const speechOptions : SpeechOptions = addSpeechEvent(client);
    speechOptions.lang = 'es-ES';
    speechOptions.profanityFilter = false;
    addServerData(guild.id, {}, {}, false, 'es-ES', speechOptions, undefined, undefined);
});


client.on('voiceStateUpdate', async (oldState: VoiceState, newState: VoiceState) => {
    const botMember = await newState.guild.members.fetch(client.user!.id);
	const guildMember = await newState.guild.members.fetch(newState.member!.id);
	const botId = client.user?.id;
    const botVoiceChannel = botMember.voice.channel?.id;


    if (newState.member?.id === botId) {
		const wasInChannel = oldState.channel;
		const isInChannel = newState.channel;

		if (wasInChannel && isInChannel && wasInChannel.id !== isInChannel.id) {
			console.log(`⚠️ El bot fue movido de ${wasInChannel.name} a ${isInChannel.name}. Desconectando...`);
			const botMember = await newState.guild.members.fetch(botId!);
			await botMember.voice.disconnect();
            //console.log(membersInOldChannel);

			console.log(`🔌 Bot desconectado tras ser movido manualmente.`);
            setConnection(undefined, oldState.guild.id);
			setAudioPlayer(undefined, oldState.guild.id);
            await wait(2000);
            const membersInOldChannel = oldState.channel?.members.filter(member => !member.user.bot);
            const oldGuildMember = await oldState.guild.members.fetch(membersInOldChannel?.first()?.user.id!)
            const interaction = {
                guildId: oldState.guild.id,
                user: { id: membersInOldChannel?.first()?.user.id },
                member: oldGuildMember,
                guild: oldState.guild,
                reply: async (message: string) => console.log('Reply:', message),
            };
            await executeJoin(interaction);
            speakText("Joselu, me cago en tu puta madre, un cordial saludo", oldState.guild.id);
            return;
		}
    }

	//Gestion cuando el bot se desconecta
	if (oldState.member?.user.id === botId) {
		const wasInChannel = oldState.channelId;
		const isInChannel = newState.channelId;
	
		if (wasInChannel && !isInChannel) {
			console.log('🔌 El bot se ha desconectado del canal de voz.');
			setConnection(undefined, oldState.guild.id);
			setAudioPlayer(undefined, oldState.guild.id);
		}
	}

    // Verificar si el miembro que se ha unido es alguien que no es el bot
    if (newState.channel && newState.member?.id !== client.user?.id && !botVoiceChannel && getServerData(oldState.guild.id)?.auto_connect) {
		// Simular la ejecución del comando /join
		const interaction = {
			guildId: newState.guild.id,
			user: { id: newState.member?.id },
			member: guildMember,
			guild: newState.guild,
			reply: async (message: string) => console.log('Reply:', message),
		};

		executeJoin(interaction);
    }

    // Verificar si el bot está solo en el canal de voz y si es asi desconectarlo
    if (oldState.channel) {
		const channel = oldState.channel;
		const botMember = channel.guild.members.me;
		if(channel.members.has(oldState.client.user!.id)){
			const membersInChannel = channel.members.filter(member => !member.user.bot);
			if (membersInChannel.size === 0) {
				botMember?.voice.disconnect();
				console.log(`Me he desconectado del canal: ${channel.name} porque no hay más usuarios.`);
			}
		}
	}
});
client.on('speech', handleSpeech);

client.login(BOT_TOKEN);