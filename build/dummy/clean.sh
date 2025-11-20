#!/bin/sh
set -eu

. ./.env

{
  echo "DROP DATABASE ${DB_NAME_DJANGO};"
  echo "CREATE DATABASE ${DB_NAME_DJANGO} OWNER ${DB_USER_DJANGO};"
} |
  docker compose exec -T db psql -U postgres

docker compose up -d django --force-recreate

docker compose logs -f django | grep -m 1 'Listening at:'
