#!/bin/sh
set -eu

awk '/COPY [_.a-z0-9]+ \(.*id\s*,/ { print $2 }' database/sql/django-dummy.sql | while read -r table; do
  # Ignore UUID id fields.
  [ "$table" = "public.employees_employee" ] && continue
  echo "SELECT pg_catalog.setval('${table}_id_seq', (SELECT MAX(id) FROM $table), true);"
done
