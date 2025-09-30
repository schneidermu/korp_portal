FROM debian:bullseye-slim

RUN apt-get update && apt-get install -y cron curl gnupg procps

RUN install -m 0755 -d /etc/apt/keyrings
RUN curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
RUN chmod a+r /etc/apt/keyrings/docker.asc
RUN echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null
RUN apt-get update && apt-get install -y docker-ce-cli

RUN apt-get install -y python3 python3-pip

WORKDIR /app

RUN pip3 install --no-cache-dir requests beautifulsoup4 lxml

COPY ./django/scripts/run_import.sh /usr/local/bin/run_import.sh
RUN chmod +x /usr/local/bin/run_import.sh

COPY ./cron/crontab /etc/cron.d/importer-cron
COPY ./cron/crontab_user /tmp/crontab_user
RUN chmod 0644 /etc/cron.d/importer-cron

RUN echo "" >> /etc/cron.d/importer-cron

RUN touch /var/log/cron.log

COPY ./cron/start.sh /start.sh
RUN chmod +x /start.sh

CMD ["/start.sh"]