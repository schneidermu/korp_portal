#!/bin/sh
set -eu

. ./.env

cd "$(dirname "$0")"

{
  cat <<EOF
UPDATE employees_employee
SET agreed_with_data_processing = false
WHERE agreed_with_data_processing;
EOF
} |
  docker compose exec -T database psql -1 -U "${POSTGRES_USER_DJANGO}" -d "${POSTGRES_DB_DJANGO}"
