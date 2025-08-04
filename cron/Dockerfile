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

RUN echo '#!/bin/bash\n\
echo "=== CRON CONTAINER STARTUP ===" \n\
echo "Starting at: $(date)"\n\
echo ""\n\
echo "Setting up environment variables for cron..."\n\
echo "NEWS_API_TOKEN=${NEWS_API_TOKEN}" >> /etc/environment\n\
echo "DJANGO_CONTAINER_NAME=${DJANGO_CONTAINER_NAME}" >> /etc/environment\n\
echo "Environment file contents:"\n\
cat /etc/environment\n\
echo ""\n\
echo "Installing user crontab..."\n\
echo "Creating crontab directly..."\n\
cat > /tmp/simple_crontab << EOF\n\
* * * * * echo "DEBUG: Simple cron test at \\$(date)" >> /var/log/cron.log 2>&1\n\
* * * * * /bin/bash -c "source /etc/environment; echo DEBUG: Env vars - NEWS_API_TOKEN=\\${NEWS_API_TOKEN:-NOT_SET} DJANGO_CONTAINER_NAME=\\${DJANGO_CONTAINER_NAME:-NOT_SET}" >> /var/log/cron.log 2>&1\n\
0 0 */3 * * /bin/bash -c "source /etc/environment; export NEWS_API_TOKEN DJANGO_CONTAINER_NAME; echo DEBUG: Starting import job at \\$(date); /usr/local/bin/run_import.sh" >> /var/log/cron.log 2>&1\n\
\n\
EOF\n\
echo "Content to install:"\n\
cat /tmp/simple_crontab\n\
echo ""\n\
crontab /tmp/simple_crontab\n\
CRONTAB_RESULT=$?\n\
echo "Crontab installation result: $CRONTAB_RESULT"\n\
if [ $CRONTAB_RESULT -eq 0 ]; then\n\
    echo "Successfully installed crontab:"\n\
    crontab -l\n\
else\n\
    echo "Failed to install crontab"\n\
    exit 1\n\
fi\n\
echo ""\n\
echo "Starting cron daemon..."\n\
service cron start\n\
echo "Cron started. Checking if running:"\n\
ps aux | grep cron | grep -v grep || echo "Cron process not found"\n\
service cron status\n\
echo ""\n\
echo "Writing test message and waiting for cron jobs..."\n\
echo "=== Container started at $(date) ===" >> /var/log/cron.log\n\
echo "Current time: $(date)"\n\
echo "Next minute should trigger cron jobs..."\n\
echo "Logs will appear below:"\n\
echo ""\n\
tail -f /var/log/cron.log' > /start.sh && chmod +x /start.sh

CMD ["/start.sh"]