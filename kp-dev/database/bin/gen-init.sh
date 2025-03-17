#!/bin/sh
set -eu

. ./.env

mkdir -p database/gen

cat >database/gen/init.sql <<EOF
CREATE USER ${POSTGRES_USER_DJANGO} WITH ENCRYPTED PASSWORD '${POSTGRES_PASSWORD_DJANGO}';
CREATE DATABASE ${POSTGRES_DB_DJANGO} OWNER ${POSTGRES_USER_DJANGO};

CREATE USER ${POSTGRES_USER_LIFERAY} WITH ENCRYPTED PASSWORD '${POSTGRES_PASSWORD_LIFERAY}';
CREATE DATABASE ${POSTGRES_DB_LIFERAY} OWNER ${POSTGRES_USER_LIFERAY};

GRANT CONNECT ON DATABASE ${POSTGRES_DB_LIFERAY} TO ${POSTGRES_USER_DJANGO};
EOF
