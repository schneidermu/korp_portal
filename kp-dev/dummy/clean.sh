#!/bin/sh
set -eu

. ./.env

{
  echo "DROP DATABASE ${POSTGRES_DB_DJANGO};"
  echo "CREATE DATABASE ${POSTGRES_DB_DJANGO} OWNER ${POSTGRES_USER_DJANGO};"
} |
  docker compose exec -T database psql -U postgres

docker compose up -d django --force-recreate

docker compose logs -f django | grep -m 1 'Listening at:'
