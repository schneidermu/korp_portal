# Nextcloud

## Docs

- <https://github.com/nextcloud/docker>
- <https://github.com/nextcloud/docker/tree/master/.examples/docker-compose/insecure/postgres/fpm>
- <https://docs.nextcloud.com/server/stable/admin_manual/configuration_server/index.html>
- `nextcloud/apps/theming/css/default.css`
- `/csrftoken`

## Installation

```sh
sudo install -o 82 -g 82 -d nextcloud/

docker compose up -d
docker compose logs -f

# Wait for the installation to complete.
# Copy the config.
sudo install -o 82 -g 82 -m 644 -t nextcloud/config/ _.config.php

# Enable custom CSS app:
./occ app:enable theming_customcss

# The app doesn't officially support Nextcloud v31 (only v29).
./occ app:enable user_external --force

# Run maintenance commands:
./occ maintenance:repair --include-expensive
./occ db:add-missing-indices
```
