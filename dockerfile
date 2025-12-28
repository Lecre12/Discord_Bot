# Node LTS sobre Debian
FROM node:24-bullseye

# Directorio de la app
WORKDIR /usr/src/app

# Copiamos archivos de dependencias primero para cache de Docker
COPY package.json package-lock.json* pnpm-lock.yaml* ./

# Instalamos dependencias de sistema necesarias
RUN apt-get update && \
    apt-get install -y \
        build-essential \
        python3 \
        libasound2-dev \
        git \
        ffmpeg \
        wget \
        unzip \
    && rm -rf /var/lib/apt/lists/*

# Instalamos dependencias Node
RUN npm install

# Copiamos el resto del proyecto
COPY yt-dlp-linux ./yt-dlp
COPY lang ./lang
COPY servers-configs ./servers-configs
COPY static-audio ./static-audio
COPY songs ./songs
COPY dist ./dist
COPY .env .env
COPY vosk_models ./vosk_models

# Puerto si el bot lo necesita
EXPOSE 3000

# Comando de inicio
CMD ["node", "dist/index.js"]
