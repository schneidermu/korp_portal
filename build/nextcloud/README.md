# Nextcloud

## Deploy

```sh
cd deploy/dev/  # or deploy/prod/

sudo install -o 82 -g 82 -d volumes/nextcloud/

# start nextcloud
docker compose --profile nextcloud up -d
# wait for the setup
docker compose logs -f nextcloud | grep 'NOTICE: ready to handle connections'
```

If you changed hostname/port, you might need to add them to `'trusted_domains'`
in the `../nextcloud/_.config.php`, then update it wait

```sh
sudo install -o 82 -g 82 -m 644 -t volumes/nextcloud/config/ ../nextcloud/_.config.php
```

Open one of these links to visit Nextcloud:

- [http://kp.localhost/api/kp/nextcloud](http://kp.localhost/api/kp/nextcloud)
- [http://kp.localhost/vite/#/nextcloud](http://kp.localhost/vite/#/nextcloud)
- [http://kp.localhost/web/guest/home#/nextcloud](http://kp.localhost/web/guest/home#/nextcloud)

(you should use your configured hostname and port)

## Docs

- <https://github.com/nextcloud/docker>
- <https://github.com/nextcloud/docker/tree/master/.examples/docker-compose/insecure/postgres/fpm>
- <https://docs.nextcloud.com/server/stable/admin_manual/configuration_server/index.html>
- `nextcloud/apps/theming/css/default.css`
- `/csrftoken`

## Links

- <http://kp.localhost/api/kp/nextcloud/settings/apps/discover>
- <http://kp.localhost/api/kp/nextcloud/settings/admin/overview>
