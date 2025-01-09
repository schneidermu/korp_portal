FROM eclipse-temurin:11-jdk-alpine AS workspace

RUN apk --no-cache add curl unzip

# Install liferay-blade-cli.
RUN curl -L https://raw.githubusercontent.com/liferay/liferay-blade-cli/master/cli/installers/global | sh

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

# Point to the right CSS.
RUN rm -rf css && sed -i s#/css/main.css#/dist/index.css# WEB-INF/liferay-portlet.xml

# Fix casing in roles.
RUN \
  sed -i s/administator/Administator/ WEB-INF/*portlet.xml && \
  sed -i s/guest/Guest/               WEB-INF/*portlet.xml && \
  sed -i 's/power-user/Power-User/'   WEB-INF/*portlet.xml && \
  sed -i s/user/User/                 WEB-INF/*portlet.xml

FROM node:22.9-alpine3.20 AS node

RUN apk add --no-cache zip && \
  corepack enable

USER 1000
WORKDIR /app

# Cache package manager.
COPY package.json ./
RUN corepack install

# Cache packages.
COPY yarn.lock .yarnrc.yml ./
RUN yarn


FROM node AS war

COPY --from=workspace --chown=1000:1000 /war /war

ENTRYPOINT [ "sh", "-c", \
  "yarn && yarn build && \
  cp -r /app/dist /war/dist && \
  cd /war && rm -f dist/index.html && \
  mkdir -p /app/pkg && zip -qr /app/pkg/korp-portal-portlet.war ." ]


FROM node AS dev

ENTRYPOINT [ "sh", "-c", "yarn && yarn dev" ]

EXPOSE 3000
