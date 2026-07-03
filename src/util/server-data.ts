import { AudioPlayer, VoiceConnection } from "@discordjs/voice";
import { SpeechOptions } from "discord-speech-recognition";
import { getServerData as getSavedServerData, saveServerData } from '../config/save-server-data';
import fs from 'fs';
import path from 'path';
import { SPANISH_LOCALE } from '../constant/language';

let serverData: Map<string, { aliasUsers: { [key: string]: string }, moveChannels: { [key: string]: string }, auto_connect:boolean, lang: string, speechOptions: SpeechOptions | undefined, connection: VoiceConnection | undefined, audioPlayer: AudioPlayer | undefined}> | null = null;

function normalizeVoiceAlias(text: string): string {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\p{L}\p{N}\s]/gu, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function normalizeAliasUsers(aliasUsers: { [key: string]: string }): { [key: string]: string } {
    return Object.entries(aliasUsers ?? {}).reduce((result, [alias, userId]) => {
        result[normalizeVoiceAlias(alias)] = userId;
        return result;
    }, {} as { [key: string]: string });
}

function normalizeMoveChannels(moveChannels: { [key: string]: string }): { [key: string]: string } {
    return Object.entries(moveChannels ?? {}).reduce((result, [channelId, alias]) => {
        result[channelId] = normalizeVoiceAlias(alias);
        return result;
    }, {} as { [key: string]: string });
}

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
                data.lang = SPANISH_LOCALE;
                data.aliasUsers = normalizeAliasUsers(data.aliasUsers);
                data.moveChannels = normalizeMoveChannels(data.moveChannels);
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
    actualServerData.lang = SPANISH_LOCALE;
    if(actualServerData.speechOptions)
    actualServerData.speechOptions.lang = SPANISH_LOCALE;

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
            lang: SPANISH_LOCALE,
            speechOptions: speechOptions,
            connection: connection,
            audioPlayer: audioPlayer,
    });
  console.log(`Idioma del servidor ${guildId}: ${SPANISH_LOCALE}`);
  saveServerData({aliasUsers, moveChannels, auto_connect, lang: SPANISH_LOCALE}, guildId);
}

export function addUserAlias(guildId: string, userId: string, alias: string){
    const data = getServerData(guildId);
    if (data) {
        data.aliasUsers[normalizeVoiceAlias(alias)] = userId;
        saveServerData(data, guildId);
    }
}

export function addChannel(guildId: string, channelId: string, alias: string){
    const data = getServerData(guildId);
    if (data) {
        data.moveChannels[channelId] = normalizeVoiceAlias(alias);
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
            const normalizedAlias = normalizeVoiceAlias(userAlias);
            if(data.aliasUsers[normalizedAlias] === userId){
                delete data.aliasUsers[normalizedAlias];
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
    
    
