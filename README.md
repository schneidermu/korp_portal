# Корпоративный портал

## Dev setup

### Database, Django & Liferay

```sh
cd kp-dev

# Create volumes:
mkdir -p volumes/deploy volumes/media

# Edit .env:
cp sample.env .env

# Generate init.sql script:
./database/bin/gen-init.sh

# Start database, Django and Liferay:
docker compose build
docker compose up -d
docker compose logs -f
```

### React

```sh
# Start React dev server:
cd kp-dev
docker compose up -d react

# Or build and deploy a WAR to Liferay:
cd react
cp sample.env .env # Edit .env.
docker build -t kp-react-war --target war .
docker run --rm -it -v ./:/app kp-react-war
cp pkg/*.war ../kp-dev/volumes/deploy
```

### Load dummy Django data

```sh
./database/bin/load-django-dummy.sh kp-dev-database-1
```

## Liferay

### Useful links

- [liferay/portal docker image](https://hub.docker.com/r/liferay/portal)
- [portal.properties spec](https://github.com/liferay/liferay-portal/blob/master/portal-impl/src/portal.properties)
- [React portlet guide](https://help.liferay.com/hc/en-us/articles/360017888032-Using-React-in-Your-Portlets)
- [React portlet example (ru)](https://github.com/Allorion/liferay-react-portlet)
- [gis.favr.ru API](https://gis.favr.ru/api/jsonws)

### Check that Liferay has fully started

The logs should say:

```sh
# INFO [main] org.apache.catalina.startup.Catalina.start Server startup in 123456 ms
```

### Build `favr-theme`

You will need `liferay-gui-develop` repo source for this.

```sh
unzip liferay-gui-develop.zip
cd liferay-gui-develop/favr-theme

docker run --rm -t -w /build -v ./:/build node:10.15.3-alpine \
  sh -c 'npm install && npm run build'
# => dist/favr-theme.war
```

See also `liferay-gui-develop/README.development.md`.

## Разворачивание бэка

```sh
cd django

python -m venv venv

source venv/Scripts/activate

pip install -r requirements.txt

python manage.py runserver
```

## Документация по ссылкам

1. <http://localhost:8000/swagger/>
2. <http://localhost:8000/redoc/>
