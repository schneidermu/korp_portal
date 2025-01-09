#!/bin/python3 -B

from itertools import permutations


title = "Ленское БВУ участвовало в забеге «Беги Форест, беги»"
text = "Ленское БВУ приняло участие в забеге «Беги, Форест, беги». Сотрудники бассейного водного управления присоединились к мероприятию, чтобы поддержать здоровый образ жизни и привлечь внимание к проблемам экологии. Забег проходил в одном из парков Москвы, участники соревновались на дистанциях от 5 до 10 километров."

print(
    "COPY public.homepage_news (id, is_published, created_at, pub_date, title, text, video) FROM stdin;"
)
for i in range(24):
    print(
        i + 1,
        "t",
        f"2024-05-{i+1:02d} 10:00:00",
        f"2024-05-{i+1:02d} 12:00:00",
        f"({i+1}) {title}",
        text,
        r"\N",
        sep="\t",
    )
print(r"\.")
print()
print("SELECT pg_catalog.setval('public.homepage_news_id_seq', 24, true);")
print()

print(
    "COPY public.homepage_news_organization (id, organization_id, news_id) FROM stdin;"
)
for i in range(24):
    print(i + 1, 1, i + 1, sep="\t")
print(r"\.")
print()
print("SELECT pg_catalog.setval('public.homepage_news_organization_id_seq', 24, true);")
print()

print("COPY public.homepage_attachment (publication_id, id, image) FROM stdin;")
for i, imgs in enumerate(permutations(range(4), r=4)):
    for j, img in enumerate(imgs):
        print(i + 1, 4 * i + j + 1, f"news_images/{img+1:02d}.png", sep="\t")
print(r"\.")
print()
print("SELECT pg_catalog.setval('public.homepage_attachment_id_seq', 96, true);")
