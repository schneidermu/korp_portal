# Развертывание backend Корпоративного портала

Требования к окружению:

- пользователь и отдельная база в PostgreSQL
- доступ к базе Liferay на том же сервере (таблицы `user_` и `contact_`)
- запуск на том же домене, что и Liferay

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

Сверить дефолтные значения для:

- `BACKEND_PORT`
- `DB_PORT`, `POSTGRES_DB`, `POSTGRES_USER`
- `POSTGRES_DB_LIFERAY`

Запуск:

```sh
cd kp-prod

# Запуск на BACKEND_PORT.
docker compose up -d
docker compose logs -f
```
