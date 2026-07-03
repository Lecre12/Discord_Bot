import fs from 'fs';
import path from 'path';
import { SPANISH_LOCALE } from '../constant/language';

export function saveServerData(serverData: any, guildId: string){
    const folderPath = path.resolve(__dirname, '../../servers-configs');
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath);
    }
    
    const dataToSave = {
        aliasUsers: serverData.aliasUsers || {},
        moveChannels: serverData.moveChannels || {},
        auto_connect: serverData.auto_connect || false,
        lang: SPANISH_LOCALE
    };

    const filePath = path.join(folderPath, `config-${guildId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(dataToSave, null, 2), 'utf-8');
}

export function deleteServerData(guildId: string){
    const folderPath = path.resolve(__dirname, '../../servers-configs');
    const filePath = path.join(folderPath, `config-${guildId}.json`);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
}

export function getServerData(guildId: string){
    const folderPath = path.resolve(__dirname, '../../servers-configs');
    const filePath = path.join(folderPath, `config-${guildId}.json`);
    if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        return {
            ...data,
            lang: SPANISH_LOCALE,
            speechOptions: undefined,
            connection: undefined,
            audioPlayer: undefined
        };
    }
    return null;
}
