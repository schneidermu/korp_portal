FROM node:22.9-alpine3.20 AS node

RUN --mount=type=cache,target=/var/cache/apk \
  apk add zip

RUN corepack enable

WORKDIR /app

# Cache package manager.
COPY package.json ./
RUN corepack install

# Cache packages.
COPY yarn.lock .yarnrc.yml ./
RUN --mount=type=cache,target=/app/.yarn \
  yarn --immutable


FROM node AS portlet

COPY --from=kp-portlet /portlet.war /

COPY . .

ENV VITE_LIFERAY_EMBED=true
ENV VITE_BACKEND_PREFIX=/api/kp

RUN yarn build && \
  rm -rf dist/index.html dist/dev/ && \
  sed -i "s/INDEX_JS/$(find dist/assets/ -name 'index-*.js' -exec basename {} +)/" view.jsp && \
  sed -i "s/INDEX_CSS/$(find dist/assets/ -name 'index-*.css' -exec basename {} +)/" view.jsp && \
  zip -qr /portlet.war view.jsp dist/

USER 1000

ENTRYPOINT [ "cat", "/portlet.war" ]


FROM node AS dev

USER 1000

ENTRYPOINT [ "sh", "-c", "yarn && yarn dev" ]

EXPOSE 3000
