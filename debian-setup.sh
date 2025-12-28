#!/bin/bash

# Script de instalación de dependencias para Debian sin interfaz gráfica
# Discord Bot con reconocimiento de voz

set -e

echo "=== Instalando dependencias del sistema para Discord Bot ==="

# Actualizar repositorios
echo "Actualizando repositorios..."
sudo apt-get update

# Dependencias base
echo "Instalando herramientas de compilación..."
sudo apt-get install -y build-essential

# Dependencias para Node.js (si no está instalado)
echo "Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo "Node.js no encontrado. Instalando..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Dependencias para @discordjs/opus y audio
echo "Instalando dependencias de audio..."
sudo apt-get install -y \
    libopus0 \
    libopus-dev \
    ffmpeg \
    libasound2-dev \
    libspeex-dev

# Dependencias para speaker (opcional si se usa)
echo "Instalando dependencias para speaker..."
sudo apt-get install -y \
    libasound2 \
    alsa-utils

# Dependencias para vosk (reconocimiento de voz)
echo "Instalando dependencias para Vosk..."
sudo apt-get install -y \
    libgomp1

# Python3 para algunas dependencias nativas
echo "Instalando Python3 para compilación..."
sudo apt-get install -y python3 python3-pip

# Limpiar
echo "Limpiando..."
sudo apt-get autoremove -y
sudo apt-get clean

echo ""
echo "=== Instalación de dependencias del sistema completada ==="
echo ""
echo "Ahora puedes instalar las dependencias de Node.js con:"
echo "  npm install"
echo "o"
echo "  pnpm install"
echo ""
echo "NOTA: Si no necesitas reproducir audio localmente (solo Discord),"
echo "      puedes ignorar errores de 'speaker' y 'say'"
