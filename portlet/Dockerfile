FROM eclipse-temurin:11-jdk-alpine AS workspace

RUN --mount=type=cache,target=/var/cache/apk \
  apk add bash curl unzip zip

SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# Install liferay-blade-cli.
RUN curl --proto "=https" --tlsv1.2 -fL \
  https://raw.githubusercontent.com/liferay/liferay-blade-cli/master/cli/installers/global | sh

WORKDIR /workspace

# Init liferay workspace and install gradle.
RUN blade init -f -v 7.1 && ./gradlew init


FROM workspace

ARG NAME

RUN blade create -t war-mvc-portlet -v 7.0 \
  -p "com.example.${NAME}" \
  -c "${NAME}" \
  "${NAME}"

COPY build.gradle "modules/${NAME}"
RUN ./gradlew build

# Customize WAR: remove extra files, fix casing in roles.
WORKDIR /dist
RUN unzip "/workspace/modules/${NAME}/build/libs/${NAME}.war" && \
  rm -rf css && \
  # sed -i /css/d WEB-INF/liferay-portlet.xml && \
  sed -i s/administator/Administator/ WEB-INF/*portlet.xml && \
  sed -i s/guest/Guest/               WEB-INF/*portlet.xml && \
  sed -i 's/power-user/Power-User/'   WEB-INF/*portlet.xml && \
  sed -i s/user/User/                 WEB-INF/*portlet.xml && \
  zip -qr /portlet.war .
