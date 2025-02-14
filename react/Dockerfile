FROM eclipse-temurin:11-jdk-alpine AS workspace

RUN --mount=type=cache,target=/var/cache/apk \
  apk add curl unzip zip

# Install liferay-blade-cli.
RUN curl --proto "=https" --tlsv1.2 -fL \
  https://raw.githubusercontent.com/liferay/liferay-blade-cli/master/cli/installers/global | sh

WORKDIR /workspace

# Init liferay workspace and install gradle.
RUN blade init -v 7.1 && ./gradlew init

# Init portlet.
RUN blade create -t war-mvc-portlet -v 7.0 -p com.example.korp-portal-portlet -c KorpPortalPortlet korp-portal-portlet

# Build WAR.
COPY liferay/build.gradle modules/korp-portal-portlet
RUN ./gradlew build

# Customize WAR.
WORKDIR /war
RUN unzip /workspace/modules/korp-portal-portlet/build/libs/korp-portal-portlet.war

COPY liferay/view.jsp .

# Point to the right CSS, fix casing in roles.
RUN rm -rf css && sed -i s#/css/main.css#/dist/index.css# WEB-INF/liferay-portlet.xml && \
  sed -i s/administator/Administator/ WEB-INF/*portlet.xml && \
  sed -i s/guest/Guest/               WEB-INF/*portlet.xml && \
  sed -i 's/power-user/Power-User/'   WEB-INF/*portlet.xml && \
  sed -i s/user/User/                 WEB-INF/*portlet.xml

RUN zip -qr korp-portal-portlet.war .

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


FROM node AS war

ENV VITE_LIFERAY_EMBED=true

COPY --from=workspace /war/korp-portal-portlet.war .

COPY . .

RUN yarn build && rm -f dist/index.html && \
  zip -qr korp-portal-portlet.war dist/

USER 1000

ENTRYPOINT [ "cat", "korp-portal-portlet.war" ]


FROM node AS dev

USER 1000

ENTRYPOINT [ "sh", "-c", "yarn && yarn dev" ]

EXPOSE 3000
