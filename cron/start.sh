#!/bin/bash

echo "=== CRON CONTAINER STARTUP ===" 
echo "Starting at: $(date)"
echo ""
echo "Setting up environment variables for cron..."
echo "NEWS_API_TOKEN=${NEWS_API_TOKEN}" >> /etc/environment
echo "DJANGO_CONTAINER_NAME=${DJANGO_CONTAINER_NAME}" >> /etc/environment
echo "Environment file contents:"
cat /etc/environment
echo ""
echo "Installing user crontab..."
echo "Creating crontab directly..."
cat > /tmp/simple_crontab << EOF
* * * * * echo "DEBUG: Simple cron test at \$(date)" >> /var/log/cron.log 2>&1
* * * * * /bin/bash -c "source /etc/environment; echo DEBUG: Env vars - NEWS_API_TOKEN=\${NEWS_API_TOKEN:-NOT_SET} DJANGO_CONTAINER_NAME=\${DJANGO_CONTAINER_NAME:-NOT_SET}" >> /var/log/cron.log 2>&1
0 0 */3 * * /bin/bash -c "source /etc/environment; export NEWS_API_TOKEN DJANGO_CONTAINER_NAME; echo DEBUG: Starting import job at \$(date); /usr/local/bin/run_import.sh" >> /var/log/cron.log 2>&1

EOF
echo "Content to install:"
cat /tmp/simple_crontab
echo ""
crontab /tmp/simple_crontab
CRONTAB_RESULT=$?
echo "Crontab installation result: $CRONTAB_RESULT"
if [ $CRONTAB_RESULT -eq 0 ]; then
    echo "Successfully installed crontab:"
    crontab -l
else
    echo "Failed to install crontab"
    exit 1
fi
echo ""
echo "Starting cron daemon..."
service cron start
echo "Cron started. Checking if running:"
ps aux | grep cron | grep -v grep || echo "Cron process not found"
service cron status
echo ""
echo "Writing test message and waiting for cron jobs..."
echo "=== Container started at $(date) ===" >> /var/log/cron.log
echo "Current time: $(date)"
echo "Next minute should trigger cron jobs..."
echo "Logs will appear below:"
echo ""
tail -f /var/log/cron.log