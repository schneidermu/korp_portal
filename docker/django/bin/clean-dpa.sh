#!/bin/sh
set -eu

cd "$(dirname "$0")"

. ../.env

{
  cat <<EOF
UPDATE employees_employee
SET agreed_with_data_processing = false;
EOF
} |
  docker compose exec -T database psql -1 -U "$DB_USER" -d "$DB_NAME"
