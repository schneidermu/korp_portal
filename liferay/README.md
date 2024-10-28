# liferay

## run

```sh
# Edit .env:
cp example.env .env

# You must own deploy folder for Liferay to pick up WARs.
mkdir deploy

docker compose up -d
docker compose logs -f
```

## apply schemas

Только при первом запуске.
Подождать, когда liferay инициализируется и запустит сервер.

```sh
# Сообщение из лога при полном запуске:
# INFO [main] org.apache.catalina.startup.Catalina.start Server startup in 123456 ms

. .env
docker exec -i liferay-db-1 pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" < schemas
```

## useful links

- [liferay/portal docker image](https://hub.docker.com/r/liferay/portal)
- [portal.properties spec](https://github.com/liferay/liferay-portal/blob/master/portal-impl/src/portal.properties)
- [react portlet guide](https://help.liferay.com/hc/en-us/articles/360017888032-Using-React-in-Your-Portlets)
- [react portlet example (ru)](https://github.com/Allorion/liferay-react-portlet)
- [gis.favr.ru api](https://gis.favr.ru/api/jsonws)
