#!/bin/sh
set -eu

. ./.env

{
  cat <<EOF
GRANT SELECT ON TABLE user_ TO ${POSTGRES_USER_DJANGO};
GRANT SELECT ON TABLE contact_ TO ${POSTGRES_USER_DJANGO};
EOF
} |
  docker compose exec -T database psql \
    -U postgres \
    -d "${POSTGRES_DB_LIFERAY}"
