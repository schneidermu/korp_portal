import random
from datetime import date
from random import randint
from uuid import uuid4

from dummy.table import Value, gen_table
from dummy.util import (
    flatten,
    load_json,
    random_date_between,
    ru_to_latin,
    pronounce_years_ru,
)

from dummy import news

EMAIL_DOMAIN = "voda.gov.ru"
BIRTH_DATE_MIN = date(1970, 1, 1)
BIRTH_DATE_MAX = date(1999, 12, 31)
BOSS_TITLES = ["Руководитель", "Начальник"]

FEED_DATE_MIN = date(2024, 1, 1)
FEED_DATE_MAX = date.today()

# "password"
PASSWORD = "pbkdf2_sha256$600000$lvosBDQr57H4gV6kJB77oJ$C/tlh7LyU5QELuZ7sjx0Famp3YVFjydPoi7O/aYhSRQ="

NUM_MALE_AVATARS = 8
NUM_FEMALE_AVATARS = 3

MIN_COWORKERS = 3
MAX_COWORKERS = 7

WORKING_AGE = 20
CURRENT_YEAR = 2025

RATING_WEIGHTS = [1, 8, 27, 64, 125]

MALE_NAMES = load_json("data/male_names.json")
FEMALE_NAMES = load_json("data/female_names.json")
ABOUT_SENTENCES = load_json("data/about_sentences.json")
SKILLS = load_json("data/skills.json")
CAREER_PATHS = load_json("data/career_paths.json")
UNIVERSITIES = load_json("data/universities.json")

ANOTHER_UNIVERSITY_CHANCE = 0.2
MAX_UNIVERSITIES = 4

POLL_QUESTIONS = load_json("data/polls.json")
POLL_ANONYMOUS_CHANCE = 0.3
POLL_VOTE_CHANCE = 0.5

STATUSES = [
    "В командировке",
    "В отпуске",
    "На больничном",
    "На рабочем месте",
    "Нет на месте",
]

orgs = [
    {"id": 1, "name": "ЦА ФАВР", "address": "Москва, Кедрова 8к1"},
    {"id": 2, "name": "Ленское БВУ", "address": "Якутск, Курашова 28/3"},
]

plans = {
    1: (
        "Руководство",
        [
            (
                "Управление гидрологии и мониторинга",
                [
                    "Отдел мониторинга качества воды",
                    "Отдел гидрологических прогнозов",
                ],
            ),
            (
                "Управление экологии и охраны водных ресурсов",
                [
                    "Отдел охраны водных экосистем",
                    "Отдел управления водными объектами",
                ],
            ),
        ],
    ),
    2: (
        "Руководство",
        [
            "Отдел водоснабжения и водоотведения",
            "Отдел научных исследований и инноваций",
        ],
    ),
}


class Subdiv:
    name: str

    def __init__(self, id: int, org_id: int, parent_id: int | None):
        self.id = id
        self.org_id = org_id
        self.parent_id = parent_id

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "organization_id": self.org_id,
            "parent_structural_subdivision_id": self.parent_id,
        }


class User:
    def __init__(
        self,
        chief_id: str | None,
        subdiv: Subdiv | None,
        sex: str | None = None,
        name: tuple[str, str, str] | None = None,
        boss_title: str | None = None,
        is_superuser: bool = False,
    ):
        assert (sex is None) == (name is None)

        self.is_superuser = is_superuser
        self.chief_id = chief_id
        self.subdiv = subdiv

        self.id = str(uuid4())
        self.skills = ", ".join(random.sample(SKILLS, k=randint(3, 7)))
        self.about = " ".join(random.sample(ABOUT_SENTENCES, k=randint(3, 5)))
        self.birth_date = random_date_between(BIRTH_DATE_MIN, BIRTH_DATE_MAX)

        if sex is None:
            self.sex = random.choice(["male", "female"])

        if name is not None:
            self.surname, self.name, self.patronym = name
        else:
            i = randint(
                1, NUM_MALE_AVATARS if self.sex == "male" else NUM_FEMALE_AVATARS
            )
            self.avatar = f"/media/avatar/{self.sex}/{i}.png"
            names = MALE_NAMES if self.sex == "male" else FEMALE_NAMES

            self.surname = random.choice(names[0])
            self.name = random.choice(names[1])
            self.patronym = random.choice(names[2])

        self.email = (
            ru_to_latin(self.surname + self.name[0] + self.patronym[0])
            + "@"
            + EMAIL_DOMAIN
        )

        age = CURRENT_YEAR - self.birth_year
        self.experience = age - WORKING_AGE
        self.career_path = random.choice(CAREER_PATHS)
        i = randint(1, len(self.career_path))
        self.career_path = self.career_path[:i]
        if boss_title is not None:
            self.career_path.append(boss_title)

        self.career_years: list[tuple[int, int | None]] = []
        k = len(self.career_path)
        y0 = self.birth_year + WORKING_AGE
        exp = 0
        for _ in range(k - 1):
            t = randint(0, self.experience - exp)
            self.career_years.append((y0 + exp, y0 + exp + t))
            exp += t
        self.career_years.append((y0 + exp, None))

        self.career_path = self.career_path[::-1]
        self.career_years = self.career_years[::-1]

        self.phone = "+7" + str(randint(800_000_00_00, 999_999_99_99))
        inner_phone = randint(0, 9999)
        self.inner_phone = f"{inner_phone // 100:02d}-{inner_phone % 100:02d}"
        self.office = "к. " + str(randint(100, 1000))

        self.service_rank = f"Советник {randint(1, 6)} ранга"
        self.status = random.choice(STATUSES)

        uni = random.choice(list(UNIVERSITIES))
        self.universities = [
            {
                "name": uni,
                "faculty": random.choice(UNIVERSITIES[uni]),
                "year": self.birth_year + WORKING_AGE + randint(-2, 2),
                "file": "",
            }
        ]
        k = random.binomialvariate(n=MAX_UNIVERSITIES, p=ANOTHER_UNIVERSITY_CHANCE)
        for _ in range(k):
            uni = random.choice(list(UNIVERSITIES))
            self.universities.append(
                {
                    "name": uni,
                    "faculty": random.choice(UNIVERSITIES[uni]),
                    "year": self.universities[-1]["year"] + 5 + randint(-1, 3),
                    "file": "",
                }
            )
        self.universities = self.universities[::-1]

    @property
    def birth_year(self):
        return self.birth_date.year

    @property
    def job_title(self):
        return self.career_path[0]

    def to_employee_dict(self) -> dict[str, Value]:
        return {
            "structural_division_id": (None if self.subdiv is None else self.subdiv.id),
            "id": self.id,
            "chief_id": self.chief_id,
            "birth_date": self.birth_date.isoformat(),
            "last_name": self.surname,
            "first_name": self.name,
            "surname": self.surname,
            "name": self.name,
            "patronym": self.patronym,
            "email": self.email,
            "username": self.email,
            "job_title": self.job_title,
            "class_rank": self.service_rank,
            "status": self.status,
            "telephone_number": self.phone,
            "inner_telephone_number": self.inner_phone,
            "office": self.office,
            "is_superuser": self.is_superuser,
            "is_active": True,
            "is_staff": True,
            "date_joined": f"{CURRENT_YEAR}-01-01",
            "avatar": self.avatar,
            "password": PASSWORD,
            "agreed_with_data_processing": False,
        }

    def to_char_dict(self, id: int) -> dict[str, Value]:
        return {
            "id": id,
            "employee_id": self.id,
            "experience": pronounce_years_ru(self.experience),
            "about": self.about,
        }

    def to_career_dicts(self, char_id):
        return [
            {
                "characteristic_id": char_id,
                "year_start": year_start,
                "year_finish": year_finish,
                "name": career,
            }
            for career, (year_start, year_finish) in zip(
                self.career_path, self.career_years
            )
        ]

    def to_uni_dict(self, char_id):
        return [{"characteristic_id": char_id, **uni} for uni in self.universities]

    def to_skills_dict(self, id: int):
        return {"characteristic_id": id, "id": id, "name": self.skills}


def gen_users(
    users: dict[str, User],
    chief_id: str | None,
    subdiv: Subdiv,
    sex: str | None = None,
    name: tuple[str, str, str] | None = None,
    boss_title: str | None = None,
):
    boss = User(
        chief_id,
        subdiv,
        sex,
        name,
        boss_title,
    )
    users[boss.email] = boss
    for _ in range(randint(MIN_COWORKERS, MAX_COWORKERS)):
        while True:
            user = User(boss.id, subdiv)
            if user.email not in users:
                users[user.email] = user
                break
    return boss


def gen_subdivs(
    subdivs: dict[int, list[Subdiv]],
    users: dict[str, User],
    org_id: int,
    plan,
    parent_id: int | None = None,
    boss: User | None = None,
):
    if org_id not in subdivs:
        subdivs[org_id] = []
    chief_id = None if boss is None else boss.id
    id = sum(map(len, subdivs.values())) + 1
    subdiv = Subdiv(id, org_id, parent_id)
    if isinstance(plan, str):
        subdiv.name = plan
        subdivs[org_id].append(subdiv)
        boss_title = random.choice(BOSS_TITLES)
        gen_users(
            users,
            chief_id,
            subdiv,
            boss_title=boss_title,
        )
    elif isinstance(plan, tuple):
        name, children = plan
        subdiv.name = name
        boss_title = random.choice(BOSS_TITLES)
        new_boss = gen_users(users, chief_id, subdiv, boss_title=boss_title)
        subdivs[org_id].append(subdiv)
        gen_subdivs(subdivs, users, org_id, plan=children, parent_id=id, boss=new_boss)
    else:
        assert isinstance(plan, list)
        for sibling in plan:
            gen_subdivs(
                subdivs,
                users,
                org_id,
                plan=sibling,
                parent_id=parent_id,
                boss=boss,
            )


def users_at_org(users: dict[str, User], org_id: int):
    return [
        user
        for user in users.values()
        if user.subdiv is not None and user.subdiv.org_id == org_id
    ]


def gen_ratings(orgs: list[dict], users: dict[str, User]):
    ratings = []
    for org in orgs:
        for user1 in users.values():
            us = users_at_org(users, org["id"])
            for user2 in random.sample(us, k=len(us) // 2):
                ratings.append(
                    {
                        "user_id": user1.id,
                        "employee_id": user2.id,
                        "rate": random.choices([1, 2, 3, 4, 5], RATING_WEIGHTS)[0],
                    }
                )
    return ratings


def gen_polls():
    polls = []
    choices: dict[int, list[dict]] = {}
    prev_date = FEED_DATE_MIN
    choice_id = 1
    for poll_id, (question, is_multiple_choice, poll_choices) in enumerate(
        POLL_QUESTIONS, start=1
    ):
        date = random_date_between(prev_date, FEED_DATE_MAX)
        prev_date = date
        polls.append(
            {
                "id": poll_id,
                "is_published": True,
                "is_anonymous": random.random() < POLL_ANONYMOUS_CHANCE,
                "is_multiple_choice": is_multiple_choice,
                "created_at": f"{date} 10:00:00+0300",
                "pub_date": f"{date} 11:00:00+0300",
                "question_text": question,
            }
        )
        choices[poll_id] = []
        for choice in poll_choices:
            choices[poll_id].append(
                {
                    "id": choice_id,
                    "poll_id": poll_id,
                    "choice_text": choice,
                }
            )
            choice_id += 1

    poll_orgs = []
    poll_votes = []
    for poll in polls:
        n = len(orgs)
        os = random.sample(orgs, max(1, random.binomialvariate(n, p=1 / n)))
        for org in os:
            poll_orgs.append(
                {
                    "id": len(poll_orgs) + 1,
                    "poll_id": poll["id"],
                    "organization_id": org["id"],
                }
            )
            us = users_at_org(users, org["id"])
            chs_ids = [ch["id"] for ch in choices[poll["id"]]]
            counts = [randint(1, 10) for _ in chs_ids]
            for user in random.sample(
                us, random.binomialvariate(len(us), p=POLL_VOTE_CHANCE)
            ):
                k = randint(1, len(chs_ids)) if poll["is_multiple_choice"] else 1
                for ch_id in set(random.sample(chs_ids, k, counts=counts)):
                    poll_votes.append(
                        {
                            "id": len(poll_votes) + 1,
                            "employee_id": user.id,
                            "choice_id": ch_id,
                        }
                    )

    return polls, choices, poll_orgs, poll_votes


# === print ===

random.seed(37)

users: dict[str, User] = {}
subdivs: dict[int, list[Subdiv]] = {}

for org_id, plan in plans.items():
    gen_subdivs(subdivs, users, org_id, plan)

email = random.choice(
    list(
        email
        for email, user in users.items()
        if user.sex == "male" and user.subdiv is not None and user.subdiv.org_id == 2
    )
)
old_id = users[email].id
users["petrov2"] = users[email]
users["petrov2"].email = "petrov2@voda.gov.ru"
users["petrov2"].surname = "Петров"
users["petrov2"].id = "c3143187-a418-5262-23a0-7a6a457a841b"
for user in users.values():
    if user.chief_id == old_id:
        user.chief_id = users["petrov2"].id
del users[email]

email = random.choice(
    list(
        email
        for email, user in users.items()
        if user.sex == "female" and user.subdiv is not None and user.subdiv.org_id == 1
    )
)
old_id = users[email].id
users["mariya3"] = users[email]
users["mariya3"].email = "mariya3@voda.gov.ru"
users["mariya3"].name = "Мария"
users["mariya3"].id = "7a52bad7-a5fe-9b01-2532-15e4e5a3de47"
for user in users.values():
    if user.chief_id == old_id:
        user.chief_id = users["mariya3"].id
del users[email]

ratings = gen_ratings(orgs, users)

polls, choices, poll_orgs, poll_votes = gen_polls()


# === generate ===

print("""
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;
""")

print(
    gen_table("employees_organization", orgs),
    gen_table(
        "employees_structuralsubdivision",
        [subdiv.to_dict() for subdivs in subdivs.values() for subdiv in subdivs],
    ),
    gen_table(
        "employees_employee",
        [user.to_employee_dict() for user in users.values()],
        seq_col=None,
    ),
    gen_table(
        "employees_characteristic",
        [user.to_char_dict(i) for i, user in enumerate(users.values(), start=1)],
    ),
    gen_table(
        "employees_career",
        [
            {"id": id, **d}
            for id, d in enumerate(
                flatten(
                    [
                        user.to_career_dicts(i)
                        for i, user in enumerate(users.values(), start=1)
                    ]
                ),
                start=1,
            )
        ],
    ),
    gen_table(
        "employees_university",
        [
            {"id": id, **d}
            for id, d in enumerate(
                flatten(
                    [
                        user.to_uni_dict(i)
                        for i, user in enumerate(users.values(), start=1)
                    ]
                ),
                start=1,
            )
        ],
    ),
    gen_table(
        "employees_competence",
        [user.to_skills_dict(i) for i, user in enumerate(users.values(), start=1)],
    ),
    gen_table(
        "employees_rating",
        [{"id": i, **r} for i, r in enumerate(ratings, start=1)],
    ),
    gen_table("homepage_poll", polls),
    gen_table("homepage_choice", flatten([chs for chs in choices.values()])),
    gen_table("homepage_poll_organization", poll_orgs),
    gen_table("homepage_choice_voted", poll_votes),
    sep="\n",
)

news.gen()
