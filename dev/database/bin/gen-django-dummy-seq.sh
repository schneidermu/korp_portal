#!/bin/sh
set -eu

awk '/COPY [_.a-z0-9]+ \(id,/ { print $2 }' database/sql/django-dummy.sql | while read -r table; do
  echo "SELECT pg_catalog.setval('${table}_id_seq', (SELECT MAX(id) FROM $table), true);"
done
