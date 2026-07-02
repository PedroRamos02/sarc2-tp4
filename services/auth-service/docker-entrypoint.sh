#!/bin/sh
set -e

echo "[auth-service] Aguardando MySQL em ${MYSQL_HOST:-mysql}:${MYSQL_PORT:-3306}..."
npx wait-on -t 60000 "tcp:${MYSQL_HOST:-mysql}:${MYSQL_PORT:-3306}"

echo "[auth-service] Executando migrations..."
npx prisma migrate deploy

echo "[auth-service] Executando seed do administrador inicial..."
node prisma/seed.js || true

echo "[auth-service] Iniciando serviço..."
exec "$@"
