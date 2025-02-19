import random
from datetime import date
from random import randint
from uuid import uuid4

from .table import Value, gen_table
from .util import flatten, load_json, random_date_between, ru_to_latin

EMAIL_DOMAIN = "voda.gov.ru"
BIRTH_DATE_MIN = date(1970, 1, 1)
BIRTH_DATE_MAX = date(1999, 12, 31)
BOSS_TITLES = ["Руководитель", "Начальник"]

# "password"
PASSWORD = "pbkdf2_sha256$600000$lvosBDQr57H4gV6kJB77oJ$C/tlh7LyU5QELuZ7sjx0Famp3YVFjydPoi7O/aYhSRQ="

NUM_MALE_AVATARS = 8
NUM_FEMALE_AVATARS = 3

WORKING_AGE = 20
CURRENT_YEAR = 2025

MALE_NAMES = load_json("data/male_names.json")
FEMALE_NAMES = load_json("data/female_names.json")
ABOUT_SENTENCES = load_json("data/about_sentences.json")
SKILLS = load_json("data/skills.json")
CAREER_PATHS = load_json("data/career_paths.json")


class User:
    def __init__(
        self,
        chief_id: str | None,
        subdiv_id: int | None,
        sex: str | None = None,
        name: tuple[str, str, str] | None = None,
        boss_title: str | None = None,
        is_superuser: bool = False,
    ):
        assert (sex is None) == (name is None)

        self.is_superuser = is_superuser
        self.chief_id = chief_id
        self.subdiv_id = subdiv_id

        self.id = str(uuid4())
        self.skills = ", ".join(random.sample(SKILLS, k=randint(3, 7)))
        self.about = " ".join(random.sample(ABOUT_SENTENCES, k=randint(3, 5)))
        self.birth_date = random_date_between(BIRTH_DATE_MIN, BIRTH_DATE_MAX)

        if sex is None:
            sex = random.choice(["male", "female"])

        if name is not None:
            self.surname, self.name, self.patronym = name
        else:
            i = randint(1, NUM_MALE_AVATARS if sex == "male" else NUM_FEMALE_AVATARS)
            self.avatar = f"/media/avatar/{sex}/{i}.png"
            names = MALE_NAMES if sex == "male" else FEMALE_NAMES

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
        self.career_years = self.career_years[::-1]

    @property
    def birth_year(self):
        return self.birth_date.year

    @property
    def job_title(self):
        return self.career_path[-1]

    def to_employee_dict(self) -> dict[str, Value]:
        return {
            "structural_division_id": self.subdiv_id,
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
            "class_rank": None,
            "status": None,
            "telephone_number": None,
            "is_superuser": self.is_superuser,
            "is_active": False,
            "is_staff": False,
            "date_joined": "2025-01-01",
            "avatar": self.avatar,
            "password": PASSWORD,
        }

    def to_char_dict(self, id: int) -> dict[str, Value]:
        return {
            "id": id,
            "employee_id": self.id,
            "experience": None,
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

    def to_skills_dict(self, id: int):
        return {"characteristic_id": id, "id": id, "name": self.skills}


class Subdiv:
    def __init__(self, id: int, name: str, org_id: int, parent_id: int):
        self.id = id
        self.name = name
        self.org_id = org_id
        self.parent_id = parent_id


def gen_users(
    users: dict[str, User],
    n: int,
    chief_id: str | None,
    subdiv_id: int | None,
    sex: str | None = None,
    name: tuple[str, str, str] | None = None,
    boss_title: str | None = None,
):
    boss = User(
        chief_id,
        subdiv_id,
        sex,
        name,
        boss_title,
    )
    users[boss.email] = boss
    for _ in range(n):
        while True:
            user = User(boss.id, subdiv_id)
            if user.email not in users:
                users[user.email] = user
                break
    return boss


def gen_subdivs(
    subdivs: list[dict],
    users: dict[str, User],
    org_id: int,
    plan,
    n: int,
    parent_id: int | None = None,
    boss: User | None = None,
):
    chief_id = None if boss is None else boss.id
    id = len(subdivs) + 1
    subdiv = {
        "id": id,
        "organization_id": org_id,
        "parent_structural_subdivision_id": parent_id,
    }
    if isinstance(plan, str):
        subdiv["name"] = plan
        subdivs.append(subdiv)
        boss_title = random.choice(BOSS_TITLES)
        gen_users(
            users,
            n=5,
            chief_id=chief_id,
            subdiv_id=id,
            boss_title=boss_title,
        )
    elif isinstance(plan, tuple):
        name, children = plan
        subdiv["name"] = name
        boss_title = random.choice(BOSS_TITLES)
        new_boss = gen_users(users, n, chief_id, subdiv_id=id, boss_title=boss_title)
        subdivs.append(subdiv)
        gen_subdivs(
            subdivs, users, org_id, plan=children, n=n, parent_id=id, boss=new_boss
        )
    else:
        assert isinstance(plan, list)
        for sibling in plan:
            gen_subdivs(
                subdivs,
                users,
                org_id,
                plan=sibling,
                n=n,
                parent_id=parent_id,
                boss=boss,
            )


def main():
    orgs = [
        {"id": 1, "name": "ЦА ФАВР", "address": "Москва, Кедрова 8к1"},
        {"id": 2, "name": "Ленское БВУ", "address": "Якутск, Курашова 28/3"},
    ]
    plans = {
        1: (
            "Руководство",
            [
                (
                    "Управление 123",
                    [
                        "Отдел 123.4",
                        "Отдел 123.5",
                    ],
                ),
                (
                    "Управление Abc",
                    [
                        "Отдел Abc.D",
                        "Отдел Abc.E",
                    ],
                ),
            ],
        ),
        2: (
            "Руководство",
            [
                "Отдел X",
                "Отдел Y",
            ],
        ),
    }
    users = {}
    subdivs = []
    for org_id, plan in plans.items():
        gen_subdivs(subdivs, users, org_id, plan, n=3)

    print(
        gen_table("employees_organization", orgs),
        gen_table("employees_structuralsubdivision", subdivs),
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
            "employees_competence",
            [user.to_skills_dict(i) for i, user in enumerate(users.values(), start=1)],
        ),
        sep="\n",
    )
