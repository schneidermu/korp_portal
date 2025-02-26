import datetime
from itertools import permutations

from .util import random_date_between


def gen():
    title = "Ленское БВУ участвовало в забеге «Беги Форест, беги»"
    text = "Ленское БВУ приняло участие в забеге «Беги, Форест, беги». Сотрудники бассейного водного управления присоединились к мероприятию, чтобы поддержать здоровый образ жизни и привлечь внимание к проблемам экологии. Забег проходил в одном из парков Москвы, участники соревновались на дистанциях от 5 до 10 километров."

    today = datetime.date.today()

    print(
        "COPY public.homepage_news (id, is_published, created_at, pub_date, title, text, video) FROM stdin;"
    )
    prev_date = datetime.date(2024, 1, 1)
    i = 0
    for i in range(24):
        date = random_date_between(prev_date, today)
        prev_date = date
        print(
            i + 1,
            "t",
            f"{date.isoformat()} 10:00:00",
            f"{date.isoformat()} 12:00:00",
            f"({i+1}) {title}",
            text,
            r"\N",
            sep="\t",
        )
        if date == today:
            break
    num_news = i + 1

    print(r"\.")
    print()
    print("SELECT pg_catalog.setval('public.homepage_news_id_seq', 24, true);")
    print()

    print(
        "COPY public.homepage_news_organization (id, organization_id, news_id) FROM stdin;"
    )
    for i in range(num_news):
        print(i + 1, 2, i + 1, sep="\t")
    print(r"\.")
    print()
    print(
        "SELECT pg_catalog.setval('public.homepage_news_organization_id_seq', 24, true);"
    )
    print()

    print("COPY public.homepage_attachment (publication_id, id, image) FROM stdin;")
    for i, imgs in enumerate(permutations(range(4), r=4)):
        if i >= num_news:
            break
        for j, img in enumerate(imgs):
            print(i + 1, 4 * i + j + 1, f"news_images/{img+1:02d}.png", sep="\t")
    print(r"\.")
    print()
    print("SELECT pg_catalog.setval('public.homepage_attachment_id_seq', 96, true);")
