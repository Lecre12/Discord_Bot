import fs from 'fs';
import path from 'path';

// Función para leer el archivo de configuración basado en guildId
export function getConfig(guildId: string) {
  const configPath = path.resolve(__dirname, `../../servers-configs/config-${guildId}.json`);

  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    return config;
  } else {
    return createConfig(guildId)
  }
}

export function updateConfig(guildId: string, newConfig: object) {
    const configPath = path.resolve(__dirname, `../../servers-configs/config-${guildId}.json`);
  
    // Convierte el objeto de configuración en un string JSON
    const configData = JSON.stringify(newConfig, null, 2);
  
    // Escribe los cambios en el archivo de configuración
    fs.writeFileSync(configPath, configData, 'utf-8');
    console.log(`Config for guild ${guildId} updated.`);
  }
export function createConfig(guildId: string){
    const configPath = path.resolve(__dirname, `../../servers-configs/config-${guildId}.json`);
    // Definir configuración por defecto
    const defaultConfig = {
        LANG: 'EN', // Idioma por defecto
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
    return defaultConfig;
}
