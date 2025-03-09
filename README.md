# Корпоративный портал

## Dev setup

```sh
cd kp-dev

# Create volumes:
mkdir -p volumes/deploy volumes/media

# Edit .env:
cp sample.env .env

# Generate init.sql script:
./database/bin/gen-init.sh

docker compose build
docker compose up -d # database django traefik liferay react
docker compose logs -f
```

### Load dummy Django data

```sh
# Load dummy.
./dummy/load.sh

# Clean database.
./dummy/clean.sh
```

### Develop Django locally in a venv

```sh
cd django

python -m venv venv
. venv/bin/activate  # On Linux.
source venv/Scripts/activate  # On Windows.

pip install -r requirements.txt
python manage.py runserver
```

## Production build

### Package React into a WAR

```sh
cd react

# Edit .env:
cp sample.env .env

docker build -t kp-react-war --target war .
docker run --rm kp-react-war > "$dist/korp-portal-portlet.war"

# Example deployment to dev Liferay:
cp "$dist"/*.war ../kp-dev/volumes/deploy
```

## Liferay

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

## Docs

### Django

- `http://localhost:8000/swagger/`
- `http://localhost:8000/redoc/`

### Liferay

- [liferay/portal docker image](https://hub.docker.com/r/liferay/portal)
- [portal.properties spec](https://github.com/liferay/liferay-portal/blob/master/portal-impl/src/portal.properties)
- [React portlet guide](https://help.liferay.com/hc/en-us/articles/360017888032-Using-React-in-Your-Portlets)
- [React portlet example (ru)](https://github.com/Allorion/liferay-react-portlet)
- [gis.favr.ru API](https://gis.favr.ru/api/jsonws)
