import path from "path";
import fs from 'fs';
import { serverData } from "..";
import { LangKeys } from "./lang-keys";

export function getMessage(key: LangKeys, guildId: string): string{
    const configPath = path.resolve(__dirname, `../../lang/${serverData.get(guildId)!.lang}.json`);
    if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

        const keys = key.split('.');
        let value: any = config;

        for (const part of keys) {
            value = value[part];
            if (value === undefined) {
                return ''; 
            }
        }

        return value;
    }else{
        return '';
    }
}