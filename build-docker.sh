#!/bin/bash
# build_export.sh
# Construye la imagen Docker y la exporta como tar.gz y zip

set -e

# Nombre de la imagen
IMAGE_NAME="discord-bot"
TAG="latest"

# Nombre del archivo de salida
TAR_FILE="${IMAGE_NAME}.tar"
TAR_GZ_FILE="${IMAGE_NAME}.tar.gz"
ZIP_FILE="${IMAGE_NAME}.zip"

echo "=== Construyendo la imagen Docker ==="
docker build -t ${IMAGE_NAME}:${TAG} .

echo "=== Guardando la imagen en ${TAR_FILE} ==="
docker save -o ${TAR_FILE} ${IMAGE_NAME}:${TAG}

echo "=== Comprimiendo la imagen ==="
# gzip
gzip -c ${TAR_FILE} > ${TAR_GZ_FILE}

# zip
zip -j ${ZIP_FILE} ${TAR_FILE}

echo "=== Limpieza ==="
# Si quieres, puedes borrar el tar original
# rm ${TAR_FILE}

echo "=== Listo ==="
echo "Archivos generados:"
echo "  - ${TAR_FILE}"
echo "  - ${TAR_GZ_FILE}"
echo "  - ${ZIP_FILE}"
