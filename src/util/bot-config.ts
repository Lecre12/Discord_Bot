import fs from 'fs';
import path from 'path';
import { client, serverData, setLang } from '../index';
import { DefaultDeserializer } from 'v8';
import { SpeechOptions } from 'discord-speech-recognition';
import { spawn } from 'child_process';
import { exit } from 'process';

// Función para leer el archivo de configuración basado en guildId
export function getConfig(guildId: string) {
  const configPath = path.resolve(__dirname, `../../servers-configs/config-${guildId}.json`);

  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    return config;
  } else {
    return createConfig(guildId);
  }
}

export function updateConfig(guildId: string, newConfig: object) {
    const configPath = path.resolve(__dirname, `../../servers-configs/config-${guildId}.json`);
  
    // Convierte el objeto de configuración en un string JSON
    const configData = JSON.stringify(newConfig, null, 2);
  
    // Escribe los cambios en el archivo de configuración
    fs.writeFileSync(configPath, configData, 'utf-8');
    const newLang = getConfig(guildId).LANG;
    setLang(newLang, guildId);
    console.log(`Config for guild ${guildId} updated. Has lang: ${newLang}`);
  }
export function createConfig(guildId: string){

    const configPath = path.resolve(__dirname, `../../servers-configs/config-${guildId}.json`);
    // Definir configuración por defecto
    const defaultConfig = {
        LANG: 'es-ES', // Idioma por defecto
        CHANNEL1: '0',
        CHANNEL2: '0',
        USERS: {},
        CHANNELS: {},
        CONNECT: false,

    };

    // Verificar si el archivo no existe
    if (!fs.existsSync(configPath)) {
        // Si el archivo no existe, lo creamos con la configuración por defecto
        fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2), 'utf-8');
        console.log(`Config for guild ${guildId} created with default values.`);
    } else {
        console.log(`Config for guild ${guildId} already exists.`);
    }
    
    // Devolver la configuración por defecto
    restartProgram();
    return defaultConfig;
}

function restartProgram() {
  console.log("Reiniciando el programa...");
  
  client.guilds.cache.forEach((guild) => {
    serverData.get(guild.id)?.connection?.destroy();
  });

  serverData.clear();


  // Ejecuta el comando `pnpm dev`
  const process = spawn('pnpm', ['dev'], { stdio: 'inherit' });

  // Cuando el proceso termina, salimos del programa actual
  process.on('close', (code) => {
      if (code === 0) {
          console.log("El programa se reinició con éxito.");
          exit();
      } else {
          console.log(`El proceso terminó con el código ${code}.`);
      }
  });
}
