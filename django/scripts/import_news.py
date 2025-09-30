import json
import sys
import time

import requests


def run(*args):
    """
    Основная функция.
    Читает JSON из stdin.
    Принимает endpoint и token как ПОЗИЦИОННЫЕ аргументы.
    """
    if len(args) < 2:
        print("Ошибка: Укажите эндпоинт и токен как позиционные аргументы.")
        print("Пример: ... runscript import_news --script-args http://... ваш_токен")
        return

    api_endpoint = args[0]
    api_token = args[1]

    news_data = None
    if not sys.stdin.isatty():
        print("Начинаю импорт новостей из стандартного потока ввода (stdin)...")
        try:
            stdin_content = sys.stdin.read()
            news_data = json.loads(stdin_content)
        except json.JSONDecodeError:
            print("Ошибка: Не удалось распознать JSON из stdin.")
            return
    else:
        print("Ошибка: Данные для импорта не были переданы через stdin.")
        return

    if not news_data:
        print("Нет данных для импорта.")
        return

    print(f"Целевой API эндпоинт: {api_endpoint}")
    if not api_token:
        print("ВНИМАНИЕ: Токен аутентификации не предоставлен.")

    headers = {"Content-Type": "application/json"}
    if api_token:
        headers["Authorization"] = f"Token {api_token}"

    success_count = 0
    failure_count = 0
    total_news = len(news_data)
    print(f"Всего новостей для импорта: {total_news}")

    for i, news_item in enumerate(news_data, 1):
        print(
            f"\n--- Отправка новости {i}/{total_news}: '{news_item.get('title', 'Без заголовка')[:50]}...' ---",
        )
        try:
            response = requests.post(
                api_endpoint, headers=headers, json=news_item, timeout=20,
            )
            if 200 <= response.status_code < 300:
                print(
                    f"  [УСПЕХ] Новость успешно создана (Статус: {response.status_code})",
                )
                success_count += 1
            else:
                print(
                    f"  [ОШИБКА] Не удалось создать новость (Статус: {response.status_code})",
                )
                print(f"  Ответ сервера: {response.text}")
                failure_count += 1
        except requests.exceptions.RequestException as e:
            print(f"  [КРИТИЧЕСКАЯ ОШИБКА] Не удалось подключиться к API: {e}")
            failure_count += 1

        time.sleep(0.5)

    print("\n=======================================================")
    print("Импорт завершен.")
    print(f"  Успешно отправлено: {success_count}")
    print(f"  С ошибками: {failure_count}")
    print("=======================================================")


# cat news.json | python manage.py runscript import_news --script-args "https://my-prod-api.com/v1/news/" "ВАШ_ПРОД_ТОКЕН"
