# Nextcloud

## Docs

- <https://github.com/nextcloud/docker>
- <https://github.com/nextcloud/docker/tree/master/.examples/docker-compose/insecure/postgres/fpm>
- <https://docs.nextcloud.com/server/stable/admin_manual/configuration_server/index.html>
- `nextcloud/apps/theming/css/default.css`
- `/csrftoken`

## Links

- <http://kp.localhost/api/kp/nextcloud/settings/apps/discover>
- <http://kp.localhost/api/kp/nextcloud/settings/admin/overview>

## Installation

```sh
cd deploy/dev/  # or deploy/prod/

sudo install -o 82 -g 82 -d volumes/nextcloud/

docker compose up -d
```
