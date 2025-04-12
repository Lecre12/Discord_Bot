import { Client, InternalDiscordGatewayAdapterCreator } from "discord.js";


export function disconnectOnLoad(client: Client){
    let totalConnections = 0;
    const listOfGuilds = new Map<string, {channelId: string, voiceAdapter: InternalDiscordGatewayAdapterCreator}>();
    for (const [_, guild] of client.guilds.cache) {
        const voiceStates = guild.voiceStates.cache;
        for (const [_, voiceState] of voiceStates) {
            if (voiceState.channel && voiceState.member?.id === client.user?.id) {
                listOfGuilds.set(guild.id, {channelId: voiceState.channel.id, voiceAdapter: voiceState.channel.guild.voiceAdapterCreator});
                
                voiceState.disconnect();
                totalConnections++;
            }
        }
    }
  console.log("Total disconnected connections: " + totalConnections);
}