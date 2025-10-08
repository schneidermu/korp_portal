# Внутренний клиент (Корпоративный портал)

## Stack

- Docker
- React (Typescript, Vite, Panda CSS) – frontend
- Lliferay (Java) – ГИС ЦП Вода
- Django REST Framework (Python) – backend
- Caddy – main proxy
- Nextcloud – self-hosting cloud
- Nginx – php cgi proxy for Nextcloud
- Postgres – database

## Функционал

- просмотр и заполнение своего профиля (по желанию)
- просмотр профилей коллег
- просмотр организационной структуры
- поиск сотрудников
- обратная связь
- календарь с дням рождения сотрудников
- просмотр, создание и импорт новостей
- прохождение, создание и редактирование опросов
- заполнение и создание заявок
- загрузка, хранение файлов, просмотр медиа, совместный доступ
  (через Nextcloud)

## Архитектура

- на [sslgis.favr.ru](https://sslgis.favr.ru) запущен Liferay
- React собирается в java-portlet (`korp-portal-portlet.war`)
  и встравивается в liferay как виджет на отдельную страницу: [sslgis.favr.ru/korp-portal/](https://sslgis.favr.ru/korp-portal/)
- так как доступен только один путь, для навигации используется фрагмент: `sslgis.favr.ru/korp-portal/#/*`.
- за `caddy` запущены Django и Nextcloud на виртуальной машине Ростова,
  в одной локальной сети с Liferay,
  а перед Nextcloud дополнительно стоит Nginx в качестве php cgi proxy
- в той же сети запущен сервер `postgres` для Liferay, в ней отдельный пользователь
  для внутреннего клиента с базами под Django и Nextcloud,
  также у него есть доступ на чтение к базе Liferay
- `https://sslgis.favr.ru/api/kp/*` направляется на backend
- для тестирования запускается
  локальный Liferay и общий instance `postgres`,
  прокси настроен след. образом:
  Liferay на `/*`, frontend на `/vite/*` и backend на `/api/kp/*`

## Деплой

См. [build/dev/README.md](./build/dev).

## Docs

Liferay (external):

- [liferay/portal docker image](https://hub.docker.com/r/liferay/portal)
- [portal.properties spec](https://github.com/liferay/liferay-portal/blob/master/portal-impl/src/portal.properties)
- [React portlet guide](https://help.liferay.com/hc/en-us/articles/360017888032-Using-React-in-Your-Portlets)
- [React portlet example (ru)](https://github.com/Allorion/liferay-react-portlet)
- [gis.favr.ru API](https://gis.favr.ru/api/jsonws)

Django (dev; you may need to adjust hostname and port):

- [swagger](http://kp.localhost/api/kp/swagger/)
- [redoc](http://kp.localhost/api/kp/redoc/)
