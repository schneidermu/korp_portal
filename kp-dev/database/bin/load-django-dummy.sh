#!/bin/sh
set -eu

if [ "$#" -ne 1 ]; then
  echo >&2 "usage: $0 <postgres-container>"
  exit 1
fi

db_container=$1

. ./.env

{
  cat database/sql/django-dummy.sql
  database/bin/gen-django-dummy-seq.sh
  database/bin/gen_news.py
  database/bin/gen_polls.py
} | docker exec -i "$db_container" psql -U "${POSTGRES_USER_DJANGO}" -d "${POSTGRES_DB_DJANGO}"
