#!/bin/sh
set -eu

. ./.env

cd "$(dirname "$0")"

python dummy.py |
  docker compose exec -T database psql -1 -U "${POSTGRES_USER_DJANGO}" -d "${POSTGRES_DB_DJANGO}"
