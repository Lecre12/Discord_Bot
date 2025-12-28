# Guía de instalación en Debian sin interfaz gráfica

## Requisitos previos

```bash
# 1. Actualizar el sistema
sudo apt-get update && sudo apt-get upgrade -y

# 2. Instalar Node.js 20.x (recomendado)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Instalar pnpm (opcional, pero recomendado)
npm install -g pnpm
```

## Instalación automática

```bash
# Dar permisos de ejecución al script
chmod +x debian-setup.sh

# Ejecutar el script de instalación
./debian-setup.sh
```

## Instalación manual de dependencias del sistema

```bash
# Herramientas de compilación
sudo apt-get install -y build-essential python3 python3-pip

# Dependencias de audio y codecs
sudo apt-get install -y \
    libopus0 \
    libopus-dev \
    ffmpeg \
    libasound2-dev \
    libspeex-dev \
    libasound2 \
    alsa-utils \
    alsa-base \
    libgomp1
```

## Instalación de dependencias de Node.js

```bash
# Usando npm
npm install

# O usando pnpm (más rápido)
pnpm install
```

## Solución de problemas comunes

### Error con `speaker` o `say`

Si obtienes errores con estas dependencias pero **NO las necesitas** (solo usas Discord para audio), puedes:

**Opción 1: Hacer las dependencias opcionales**

Edita `package.json` y mueve `speaker` y `say` a `optionalDependencies`:

```json
{
  "dependencies": {
    "...otras dependencias..."
  },
  "optionalDependencies": {
    "say": "^0.16.0",
    "speaker": "^0.5.5"
  }
}
```

**Opción 2: Instalar con flag --omit=optional**

```bash
npm install --omit=optional
```

**Opción 3: Eliminar del package.json si no se usan**

### Error con `@discordjs/opus`

```bash
# Instalar libopus
sudo apt-get install -y libopus-dev libopus0

# Limpiar caché y reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Error con `vosk`

```bash
# Verificar que libgomp1 esté instalado
sudo apt-get install -y libgomp1

# Si persiste, instalar más dependencias
sudo apt-get install -y libgfortran5
```

### Configurar ALSA sin interfaz gráfica (si usas `speaker`)

Crear archivo `/etc/asound.conf`:

```bash
sudo nano /etc/asound.conf
```

Agregar:

```
pcm.!default {
    type hw
    card 0
}

ctl.!default {
    type hw
    card 0
}
```

### Error: "Could not detect abi"

```bash
# Instalar node-gyp globalmente
npm install -g node-gyp

# Instalar headers de Node.js
sudo apt-get install -y nodejs-dev
```

## Compilación del proyecto

```bash
# TypeScript a JavaScript
npm run build

# O con pnpm
pnpm build
```

## Ejecutar el bot

```bash
# Modo desarrollo (con hot-reload)
npm run dev

# Modo producción
npm start
```

## Usando Docker (alternativa recomendada)

Si tienes muchos problemas con dependencias nativas, considera usar Docker:

```bash
# Construir imagen
docker build -t discord-bot .

# Ejecutar contenedor
docker run -d --name discord-bot \
  --restart unless-stopped \
  -v $(pwd)/servers-configs:/app/servers-configs \
  -v $(pwd)/static-audio:/app/static-audio \
  discord-bot
```

## Permisos y variables de entorno

```bash
# Crear archivo .env
cp .env.example .env
nano .env

# Asegurarse de que los directorios tengan permisos correctos
chmod -R 755 servers-configs static-audio vosk_models
```

## Monitoreo con PM2 (recomendado para producción)

```bash
# Instalar PM2
npm install -g pm2

# Iniciar el bot
pm2 start dist/index.js --name discord-bot

# Configurar inicio automático
pm2 startup
pm2 save

# Ver logs
pm2 logs discord-bot

# Reiniciar
pm2 restart discord-bot
```
