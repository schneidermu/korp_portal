# Deploy (dev)

## Django & Vite

```sh
cd build/dev

# edit .env
cp sample.env .env
vi .env
# check envars
docker compose config

# make sure these volumes exist and are own by uid 1000
mkdir -p volumes/logs volumes/media volumes/deploy
# unpack dummy media
tar -C volumes -xpvf /path/to/dummy-media.tar.bz2

# start vite & django
docker compose up -d

# generate django admin static files
docker compose exec -u root django python manage.py collectstatic

# apply django migrations
docker compose exec django python manage.py migrate

# generate & load dummy django data
../dummy/load.sh

# start news importer
docker compose --profile news up -d

# generate dynamic css
docker compose exec vite pnpm panda
```

Open [http://kp.localhost/vite/](http://kp.localhost/vite/)
to view react app by itself
(or use your configured hostname and port).

## Liferay

```sh
# start liferay
docker compose --profile liferay up -d
# wait for the startup
docker compose logs -f liferay | grep 'Server startup in'
```

Package React app into a portlet, for that see [react/README.md](`../../react`).

```sh
# deploy portlet
cp /path/to/korp-portal-portlet.war volumes/deploy
# wait for it to process
docker compose logs -f liferay | grep 'STARTED korp-portal-portlet'

# deploy favr-theme
cp /path/to/favr-theme.war volumes/deploy
# wait for it to process
docker compose logs -f liferay | grep 'STARTED favr-theme'
```

Open [http://kp.locahost](http://kp.locahost) to visit Liferay.
The page may take a while to load.
Click "Sign In" and enter admin credientials from [portal-ext.properties](./liferay/portal-ext.properties).

Remove the welcome widget, click "+" at the top left.
Type "korp-portal" into the search bar, and add the widget.

Click the gear icon next to the "+",
wait for the setting to load and open the "Look and Feel" tab.
Choose the "Define a specific look and feel for this page" option.
Click "Change current theme" and choose favr_theme.
Click "Save".
Wait for the theme to apply and reload the page.

## Nextcloud

See [build/nextcloud/README.md](../nextcloud/).

## `favr-theme` (from scratch)

You will need `liferay-gui-develop` repo source for this.

```sh
unzip /path/to/liferay-gui-develop.zip
cd liferay-gui-develop/favr-theme

docker run --rm -t -w /build -v ./:/build node:10.15.3-alpine \
  sh -c 'npm install && npm run build'
# -> dist/favr-theme.war
```

See also `liferay-gui-develop/README.development.md`.
