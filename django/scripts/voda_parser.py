import argparse
import base64
import json
import time
from urllib.parse import urljoin
from datetime import date, timedelta

import requests
import urllib3
from bs4 import BeautifulSoup

ORGANIZATION_ID = [None]
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"
}
PROXIES = {"http": None, "https": None}
URLS = {
    "federal": "https://voda.gov.ru/press-tsenter/news/federalnye/",
    "regional": "https://voda.gov.ru/press-tsenter/news/regionalnye/",
}


def format_date_to_iso(date_string):
    month_map = {
        "января": "01",
        "февраля": "02",
        "марта": "03",
        "апреля": "04",
        "мая": "05",
        "июня": "06",
        "июля": "07",
        "августа": "08",
        "сентября": "09",
        "октября": "10",
        "ноября": "11",
        "декабря": "12",
    }
    try:
        day, month_name, year = date_string.split()
        month = month_map.get(month_name.lower())
        if not month:
            return None
        day_formatted = f"{int(day):02d}"
        return f"{year}-{month}-{day_formatted}T10:00:00Z"
    except Exception as e:
        print(
            f"  [!] Не удалось отформатировать дату '{date_string}': {e}",
            file=sys.stderr,
        )
        return None


def get_article_details(article_url, image_url):
    """
    Функция для получения чистого текста статьи.
    """
    details = {"text": "", "base64_image": None}

    try:
        print(f"  -> Запрос на страницу статьи: {article_url}", file=sys.stderr)
        response = requests.get(
            article_url, headers=HEADERS, proxies=PROXIES, verify=False, timeout=15
        )
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "lxml")

        text_container = soup.find("div", class_="content")

        if text_container:
            paragraphs = text_container.find_all("p")

            clean_paragraph_texts = []
            for p in paragraphs:
                p_text = p.get_text(strip=True)

                if "Пресс-служба Росводресурсов" in p_text:
                    break

                if p_text:
                    clean_paragraph_texts.append(p_text)

            details["text"] = "\n\n".join(clean_paragraph_texts)

            if not details["text"]:
                details["text"] = "Текст статьи не найден (отсутствуют теги <p>)."

        else:
            details["text"] = "Текст статьи не найден (отсутствует div.content)."

    except requests.RequestException as e:
        print(f"  [!] Ошибка при получении текста статьи: {e}", file=sys.stderr)
        details["text"] = f"Не удалось загрузить текст: {e}"

    if image_url:
        try:
            print(f"  -> Загрузка изображения: {image_url}", file=sys.stderr)
            img_response = requests.get(
                image_url, headers=HEADERS, proxies=PROXIES, verify=False, timeout=15
            )
            img_response.raise_for_status()
            encoded_string = base64.b64encode(img_response.content).decode("utf-8")
            content_type = img_response.headers.get("Content-Type", "image/jpeg")
            details["base64_image"] = f"data:{content_type};base64,{encoded_string}"
        except requests.RequestException as e:
            print(f"  [!] Ошибка при загрузке изображения: {e}", file=sys.stderr)

    return details


def parse_voda_gov(base_url, start_date, end_date):
    """
    Основная функция-парсер.
    """
    all_news_formatted = []
    params = {
        "arrFilterNews_DATE_ACTIVE_FROM_1": start_date,
        "arrFilterNews_DATE_ACTIVE_FROM_2": end_date,
        "set_filter": "Y",
    }

    print(f"\nОтправка запроса на получение новостей из {base_url}...", file=sys.stderr)
    try:
        list_response = requests.get(
            base_url,
            params=params,
            headers=HEADERS,
            proxies=PROXIES,
            verify=False,
            timeout=15,
        )
        list_response.raise_for_status()

        soup = BeautifulSoup(list_response.text, "lxml")
        news_items = soup.find_all("a", class_="article")

        if not news_items:
            print("Новости по заданным критериям не найдены.")
            return []

        print(
            f"Найдено {len(news_items)} новостей. Начинаю детальную обработку...",
            file=sys.stderr,
        )

        for item in news_items:
            title_tag = item.find("h6", class_="article__title")
            date_tag = item.find("time", class_="article__date")
            img_tag = item.find("img")
            title = title_tag.text.strip() if title_tag else "Нет заголовка"
            date_str = date_tag.text.strip() if date_tag else ""
            article_url = urljoin(base_url, item.get("href", ""))
            image_url = (
                urljoin(base_url, img_tag.get("src", ""))
                if img_tag and img_tag.get("src")
                else None
            )

            print(f"\nОбработка новости: '{title}'", file=sys.stderr)
            details = get_article_details(article_url, image_url)
            iso_date = format_date_to_iso(date_str)

            attachments = []
            if details["base64_image"]:
                attachments.append({"image": details["base64_image"]})

            all_news_formatted.append(
                {
                    "title": title,
                    "text": details["text"],
                    "pub_date": iso_date,
                    "attachments": attachments,
                }
            )
            time.sleep(0.5)

    except requests.RequestException as e:
        print(f"Критическая ошибка при парсинге списка новостей: {e}", file=sys.stderr)

    return all_news_formatted


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Парсер новостей с voda.gov.ru за последние 3 дня."
    )

    parser.add_argument(
        "news_type",
        choices=["federal", "regional"],
        help="Тип новостей для парсинга: 'federal' или 'regional'",
    )
    parser.add_argument(
        "-o",
        "--output",
        help="Имя выходного файла. Если не указано, результат выводится в stdout.",
    )

    args = parser.parse_args()

    today = date.today()
    start_date_obj = today - timedelta(days=3)

    end_date_str = today.strftime("%d.%m.%Y")
    start_date_str = start_date_obj.strftime("%d.%m.%Y")

    import sys

    print(
        f"Запуск парсинга для типа '{args.news_type}' за период с {start_date_str} по {end_date_str}",
        file=sys.stderr,
    )

    selected_url = URLS[args.news_type]

    news_data = parse_voda_gov(selected_url, start_date_str, end_date_str)

    if news_data:
        if args.output:
            output_filename = args.output
            with open(output_filename, "w", encoding="utf-8") as f:
                json.dump(news_data, f, ensure_ascii=False, indent=4)
            print(f"Данные сохранены в файл: {output_filename}", file=sys.stderr)
        else:
            print(json.dumps(news_data, ensure_ascii=False))

    else:
        print("Новости за указанный период не найдены.", file=sys.stderr)
