FROM eclipse-temurin:11-jdk-alpine

RUN --mount=type=cache,target=/var/cache/apk \
  apk add bash curl unzip zip

SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# Install liferay-blade-cli.
RUN curl --proto "=https" --tlsv1.2 -fL \
  https://raw.githubusercontent.com/liferay/liferay-blade-cli/master/cli/installers/global | sh

WORKDIR /workspace

# Init liferay workspace and install gradle.
RUN blade init -f -v 7.1 && ./gradlew init

COPY build.gradle ./
COPY build.sh /build.sh

ENTRYPOINT ["/build.sh"]
