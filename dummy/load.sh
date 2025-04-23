#!/bin/sh
set -eu

. ./.env

cd "$(dirname "$0")"

python -B dummy.py |
  docker compose -p "$COMPOSE_NAME" exec -T db psql -1 -U "$DB_USER_DJANGO" -d "$DB_NAME_DJANGO"
