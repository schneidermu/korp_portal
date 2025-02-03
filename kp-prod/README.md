# Развертывание backend Корпоративного портала

Требования к окружению:

- пользователь и отдельная база в PostgreSQL
- пользователь LDAP
- включённый экспорт из Liferay в LDAP
- запуск на том же домене/IP, что и Liferay

Конфигурация:

```sh
cd kp-prod

# Создать папку под volumes:
mkdir -p volumes/media

# Заполнить .env.
cp sample.env .env
```

Заполнить:

- `SECRET_KEY` (Django)

  ```sh
  # Генерация случайного ключа:
  python3 -c 'import secrets; print(secrets.token_urlsafe(64))'
  ```

- `HOSTNAME`
- `DB_HOST`, `POSTGRES_PASSWORD`
- `LDAP_ROOT`, `LDAP_PASSWORD`

Сверить дефолтные значения для:

- `BACKEND_PORT`
- `DB_PORT`, `POSTGRES_DB`, `POSTGRES_USER`
- `LDAP_USER`

Запуск:

```sh
cd kp-prod

# Запуск на BACKEND_PORT.
docker compose up -d
docker compose logs -f
```
