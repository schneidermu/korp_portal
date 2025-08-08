#!/bin/bash

echo "--------------------------------------"
echo "Запуск импорта новостей: $(date)"
echo "Current user: $(whoami)"
echo "Current working directory: $(pwd)"
echo "Environment variables:"
echo "NEWS_API_TOKEN: ${NEWS_API_TOKEN:-'NOT SET'}"
echo "DJANGO_CONTAINER_NAME: ${DJANGO_CONTAINER_NAME:-'NOT SET'}"
echo "PATH: $PATH"

PYTHON_EXEC="/usr/bin/python3"
PARSER_SCRIPT_PATH="/app/scripts/voda_parser.py"

if [ -z "$NEWS_API_TOKEN" ] || [ -z "$DJANGO_CONTAINER_NAME" ]; then
    echo "Предупреждение: Переменные окружения NEWS_API_TOKEN и DJANGO_CONTAINER_NAME не установлены." >&2
    echo "NEWS_API_TOKEN=${NEWS_API_TOKEN:-'EMPTY'}"
    echo "DJANGO_CONTAINER_NAME=${DJANGO_CONTAINER_NAME:-'EMPTY'}"
    echo "Пропускаем выполнение основной логики."
    echo "--------------------------------------"
    exit 0
fi

# Check if docker is available
if ! command -v docker &> /dev/null; then
    echo "Предупреждение: Docker команда не найдена в PATH" >&2
    echo "Доступные команды в PATH:"
    which python3 || echo "python3 не найден"
    which bash || echo "bash не найден"
    echo "--------------------------------------"
    exit 0
fi

echo "Docker найден: $(which docker)"

# Check if container is running
if ! docker ps --format "table {{.Names}}" | grep -q "^${DJANGO_CONTAINER_NAME}$"; then
    echo "Предупреждение: Контейнер $DJANGO_CONTAINER_NAME не запущен или не найден" >&2
    echo "Запущенные контейнеры:"
    docker ps --format "table {{.Names}}\t{{.Status}}" || echo "Не удалось получить список контейнеров"
    echo "--------------------------------------"
    exit 0
fi

echo "Контейнер $DJANGO_CONTAINER_NAME найден и запущен"

echo "-> Парсинг и импорт ФЕДЕРАЛЬНЫХ новостей..."

$PYTHON_EXEC $PARSER_SCRIPT_PATH federal | docker exec -i $DJANGO_CONTAINER_NAME python manage.py runscript import_news --script-args "http://django:8000/kp/api/news/" "$NEWS_API_TOKEN"

echo "-> Парсинг и импорт РЕГИОНАЛЬНЫХ новостей..."
$PYTHON_EXEC $PARSER_SCRIPT_PATH regional | docker exec -i $DJANGO_CONTAINER_NAME python manage.py runscript import_news --script-args "http://django:8000/kp/api/news/" "$NEWS_API_TOKEN"

echo "Импорт завершен: $(date)"
echo "--------------------------------------"