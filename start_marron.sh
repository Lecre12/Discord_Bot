#!/bin/bash
# Script robusto para lanzar el bot con systemd

cd /home/lecre/marron_code/ || exit 1

# Cargar nvm si existe
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Usar Node.js 24 si está instalado con nvm
nvm use 24 > /dev/null 2>&1 || echo "[WARN] nvm o Node 24 no disponible, usando node por defecto"

# Buscar pnpm en el PATH o en .local/share/pnpm
if command -v pnpm >/dev/null 2>&1; then
    PNPM_CMD="pnpm"
elif [ -f "$HOME/.local/share/pnpm/pnpm" ]; then
    PNPM_CMD="$HOME/.local/share/pnpm/pnpm"
else
    echo "[ERROR] pnpm no encontrado. Instala pnpm con 'npm install -g pnpm' o 'corepack enable'"
    exit 1
fi

# Lanzar el bot
$PNPM_CMD start
