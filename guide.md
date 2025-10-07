# Внутренний клиент (Корпоративный портал)

## описание

технологии:

- docker
- react (typescript), frontend
- liferay (java), ГИС ЦП Вода
- django rest framework (python), backend
- caddy, frontend proxy
- nextcloud, self-hosting cloud
- nginx, php cgi proxy
- postgres, database

функционал:

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
  (через nextcloud)

архитектура:

- на [sslgis.favr.ru](https://sslgis.favr.ru) запущен liferay
- react собирается в java-portlet (`korp-portal-portlet.war`)
  и встравивается в liferay как виджет на отдельную страницу: [sslgis.favr.ru/korp-portal/](https://sslgis.favr.ru/korp-portal/)
- так как доступен только один путь, для навигации используется фрагмент: `sslgis.favr.ru/korp-portal/#/*`.
- за caddy запущены django и nextcloud на вм Ростова,
  в одной локальной сети с liferay,
  а перед nextcloud дополнительно стоит nginx в качестве php cgi proxy
- в той же сети запущена postgres для liferay, в ней отдельный пользователь
  для внутреннего клиента с базами под django и nextcloud,
  также у него есть доступ на чтение к базе liferay
- `https://sslgis.favr.ru/api/kp/*` направляется на backend

## технические особенности

- frontend встраивается

Frontend: React, встраивается как виджет (Java portlet, `.war`)
в Liferay (на котором работает ГИС ЦП Вода).

tooling:

- docker, alpine
- [vite](https://vite.dev/), build tool
- [pnpm](https://pnpm.io/), package manager
- [eslint](https://eslint.org/), linter
- [prettier](https://prettier.io/), formatter

stack:

- react, typescript
- [vercel/swr](https://swr.vercel.app/), data fetching
- [redux](https://redux.js.org/), state management
- [react-router](https://reactrouter.com/), routing
- [immer](https://immerjs.github.io/immer/), immutability helper
- [panda-css](https://panda-css.com/), CSS framework

Backend: Django REST Framework.

## deploy

### 1
