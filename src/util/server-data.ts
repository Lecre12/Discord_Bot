import { AudioPlayer, VoiceConnection } from "@discordjs/voice";
import { SpeechOptions } from "discord-speech-recognition";
import { getServerData as getSavedServerData, saveServerData } from '../config/save-server-data';
import fs from 'fs';
import path from 'path';

let serverData: Map<string, { aliasUsers: { [key: string]: string }, moveChannels: { [key: string]: string }, auto_connect:boolean, lang: string, speechOptions: SpeechOptions | undefined, connection: VoiceConnection | undefined, audioPlayer: AudioPlayer | undefined}> | null = null;

export function getServersData(){
    return serverData;
}

export function startServerData(){
    serverData = new Map();
        
    const folderPath = path.resolve(__dirname, '../../servers-configs');
    if (fs.existsSync(folderPath)) {
        const files = fs.readdirSync(folderPath)
                        .filter(file => file.startsWith('config-') && file.endsWith('.json'));
        
        files.forEach(file => {
            const guildId = file.replace('config-', '').replace('.json', '');
            const data = getSavedServerData(guildId);
            if (data) {
                serverData?.set(guildId, data);
            }
        });
    }
    return serverData;
}

export function getServerData(guildId: string){
    const data = getServersData()?.get(guildId);
    if(data === undefined){
        return null;
    }
    return data;
}

export function setServerLang(newLang: string, guildId: string){
    const actualServerData = getServerData(guildId);
    if(actualServerData === null){
        return;
    }
    actualServerData.lang = newLang;
    if(actualServerData.speechOptions)
    actualServerData.speechOptions.lang = newLang;

    getServersData()?.set(guildId, actualServerData);
}

export function setServerSpeechOptions(newSpeechOptions: SpeechOptions, guildId: string){
    const actualServerData = getServerData(guildId);
    if(actualServerData === null){
        return;
    }
    actualServerData.speechOptions = newSpeechOptions;
    getServersData()?.set(guildId, actualServerData);
}

export function setConnection(connection: VoiceConnection | undefined, guildId: string){
    const actualServerData = getServerData(guildId);
    if(actualServerData === null){
        return;
    }
    actualServerData.connection = connection;
    getServersData()?.set(guildId, actualServerData);
}

export function setAudioPlayer(audioPlayer: AudioPlayer | undefined, guildId: string){
    const actualServerData = getServerData(guildId);
    if(actualServerData === null){
        return;
    }
    actualServerData.audioPlayer = audioPlayer;
    getServersData()?.set(guildId, actualServerData);
}

export function addServerData(guildId: string, aliasUsers: { [key: string]: string }, moveChannels: { [key: string]: string }, auto_connect:boolean, lang: string, speechOptions: SpeechOptions | undefined, connection: VoiceConnection | undefined, audioPlayer: AudioPlayer | undefined){
    getServersData()?.set(guildId, {
        aliasUsers: aliasUsers,
            moveChannels: moveChannels,
            auto_connect: auto_connect,
            lang: lang,
            speechOptions: speechOptions,
            connection: connection,
            audioPlayer: audioPlayer,
    });
  console.log(`Language for this guild: ${lang}`);
  saveServerData({aliasUsers, moveChannels, auto_connect, lang}, guildId);
}

export function addUserAlias(guildId: string, userId: string, alias: string){
    const data = getServerData(guildId);
    if (data) {
        data.aliasUsers[alias.toLowerCase()] = userId;
        saveServerData(data, guildId);
    }
}

export function addChannel(guildId: string, channelId: string, alias: string){
    const data = getServerData(guildId);
    if (data) {
        data.moveChannels[channelId] = alias;
        saveServerData(data, guildId);
    }
}

export function removeChannel(guildId: string, channelId: string){
    const data = getServerData(guildId);
    if (data) {
        delete data.moveChannels[channelId];
        saveServerData(data, guildId);
    }
}

export function removeUserAlias(guildId: string, userId: string, userAlias: string){
    const data = getServerData(guildId);
    if (data) {
        if(userAlias){
            if(data.aliasUsers[userAlias.toLowerCase()] === userId){
                delete data.aliasUsers[userAlias.toLowerCase()];
                saveServerData(data, guildId);
            }
        }else {
            for (const [alias, id] of Object.entries(data.aliasUsers)) {
                if (id === userId) {
                    delete data.aliasUsers[alias];
                }
            }
            saveServerData(data, guildId);
        }
    }
}

export function setAutoJoin(guildId: string, autoConnect: boolean){
    const data = getServerData(guildId);
    if (data) {
        data.auto_connect = autoConnect;
        saveServerData(data, guildId);
    }
}
    
    