#!/bin/sh
set -eu

for i in $(seq 1 "$DB_COUNT"); do
  user="DB_${i}_USER"
  name="DB_${i}_NAME"
  password="DB_${i}_PASSWORD"

  psql -v ON_ERROR_STOP=1 -U postgres <<EOF
    CREATE USER "${!user}" WITH PASSWORD '${!password}';
    CREATE DATABASE "${!name}";
    GRANT ALL PRIVILEGES ON DATABASE "${!name}" TO "${!user}";
EOF

done
