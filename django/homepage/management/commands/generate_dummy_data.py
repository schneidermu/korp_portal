"""
Django management command для генерации полных тестовых данных.

Генерирует:
- Организации
- Структурные подразделения
- Сотрудников (с иерархией)
- Компетенции
- Характеристики сотрудников
- Новости
- Обучающие видео и курсы

Использование:
    python manage.py generate_dummy_data
    python manage.py generate_dummy_data --create-admin
    python manage.py generate_dummy_data --clear
"""

import random
from datetime import date, timedelta
from uuid import uuid4

from django.core.management.base import BaseCommand
from django.utils import timezone

from employees.models import (
    Career,
    Characteristic,
    Competence,
    Employee,
    Organization,
    StructuralSubdivision,
    University,
)
from homepage.models import Attachment, Course, CourseVideo, News, Video

# Константы
EMAIL_DOMAIN = "voda.gov.ru"
BIRTH_DATE_MIN = date(1970, 1, 1)
BIRTH_DATE_MAX = date(1999, 12, 31)
BOSS_TITLES = ["Руководитель", "Начальник"]
PASSWORD = "pbkdf2_sha256$600000$lvosBDQr57H4gV6kJB77oJ$C/tlh7LyU5QELuZ7sjx0Famp3YVFjydPoi7O/aYhSRQ="  # "password"

MIN_COWORKERS = 3
MAX_COWORKERS = 7
WORKING_AGE = 20
CURRENT_YEAR = 2025

MALE_CHANCE = 0.73  # 8/(8+3)

STATUSES = [
    "В командировке",
    "В отпуске",
    "На больничном",
    "На рабочем месте",
    "Нет на месте",
]

# Данные
MALE_NAMES = {
    "surnames": [
        "Иванов",
        "Петров",
        "Сидоров",
        "Смирнов",
        "Кузнецов",
        "Попов",
        "Васильев",
        "Соколов",
    ],
    "names": [
        "Александр",
        "Дмитрий",
        "Сергей",
        "Андрей",
        "Алексей",
        "Михаил",
        "Иван",
        "Владимир",
    ],
    "patronyms": [
        "Александрович",
        "Дмитриевич",
        "Сергеевич",
        "Андреевич",
        "Алексеевич",
        "Михайлович",
    ],
}

FEMALE_NAMES = {
    "surnames": [
        "Иванова",
        "Петрова",
        "Сидорова",
        "Смирнова",
        "Кузнецова",
        "Попова",
        "Васильева",
        "Соколова",
    ],
    "names": ["Анна", "Мария", "Елена", "Ольга", "Наталья", "Татьяна"],
    "patronyms": [
        "Александровна",
        "Дмитриевна",
        "Сергеевна",
        "Андреевна",
        "Алексеевна",
        "Михайловна",
    ],
}

ABOUT_SENTENCES = [
    "Опытный специалист с большим стажем работы.",
    "Ответственный и инициативный сотрудник.",
    "Постоянно повышает квалификацию.",
    "Хорошо работает в команде.",
    "Владеет современными технологиями.",
]

SKILLS = [
    "Python",
    "Django",
    "PostgreSQL",
    "Docker",
    "Git",
    "React",
    "JavaScript",
    "TypeScript",
    "REST API",
    "Управление проектами",
    "Аналитика",
    "Документирование",
]

CAREER_PATHS = [
    ["Специалист", "Старший специалист", "Ведущий специалист"],
    ["Инженер", "Старший инженер", "Главный инженер"],
    ["Аналитик", "Старший аналитик", "Ведущий аналитик"],
]

UNIVERSITIES = {
    "МГУ им. М.В. Ломоносова": [
        "Факультет вычислительной математики и кибернетики",
        "Географический факультет",
    ],
    "МГТУ им. Н.Э. Баумана": [
        "Факультет информатики и систем управления",
        "Факультет инженерного бизнеса",
    ],
    "СПбГУ": ["Факультет прикладной математики", "Факультет географии и геоэкологии"],
}


def random_date_between(start_date, end_date):
    """Генерирует случайную дату между start_date и end_date."""
    days_between = (end_date - start_date).days
    random_days = random.randint(0, days_between)
    return start_date + timedelta(days=random_days)


def ru_to_latin(text):
    """Транслитерация русского текста в латиницу."""
    translit_map = {
        "а": "a",
        "б": "b",
        "в": "v",
        "г": "g",
        "д": "d",
        "е": "e",
        "ё": "e",
        "ж": "zh",
        "з": "z",
        "и": "i",
        "й": "y",
        "к": "k",
        "л": "l",
        "м": "m",
        "н": "n",
        "о": "o",
        "п": "p",
        "р": "r",
        "с": "s",
        "т": "t",
        "у": "u",
        "ф": "f",
        "х": "h",
        "ц": "ts",
        "ч": "ch",
        "ш": "sh",
        "щ": "sch",
        "ъ": "",
        "ы": "y",
        "ь": "",
        "э": "e",
        "ю": "yu",
        "я": "ya",
    }
    return "".join(translit_map.get(c.lower(), c) for c in text)


class Command(BaseCommand):
    help = "Генерирует полные тестовые данные для системы"

    def add_arguments(self, parser):
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Очистить существующие данные перед генерацией",
        )
        parser.add_argument(
            "--create-admin",
            action="store_true",
            help="Создать суперпользователя admin/admin",
        )

    def handle(self, *args, **options):
        clear_data = options["clear"]
        create_admin = options["create_admin"]

        if clear_data:
            self.stdout.write(self.style.WARNING("Очистка существующих данных..."))
            self.clear_data()

        self.stdout.write(self.style.SUCCESS("Начало генерации данных..."))

        # Создаем организации
        orgs = self.create_organizations()
        self.stdout.write(self.style.SUCCESS(f"Создано {len(orgs)} организаций"))

        # Создаем структуру подразделений и сотрудников
        all_employees = []
        for org in orgs:
            employees = self.create_org_structure(org)
            all_employees.extend(employees)

        self.stdout.write(
            self.style.SUCCESS(f"Создано {len(all_employees)} сотрудников")
        )

        # Создаем компетенции
        competences = self.create_competences()
        self.stdout.write(self.style.SUCCESS(f"Создано {len(competences)} компетенций"))

        # Создаем характеристики для сотрудников
        chars_count = self.create_characteristics(all_employees, competences)
        self.stdout.write(self.style.SUCCESS(f"Создано {chars_count} характеристик"))

        # Создаем новости
        news_count = self.create_news(all_employees, orgs)
        self.stdout.write(self.style.SUCCESS(f"Создано {news_count} новостей"))

        # Создаем обучающие видео и курсы
        videos, courses = self.create_educational_content(all_employees)
        self.stdout.write(
            self.style.SUCCESS(f"Создано {len(videos)} видео и {len(courses)} курсов")
        )

        if create_admin:
            self.create_admin_user()

        self.stdout.write(
            self.style.SUCCESS("\n✅ Генерация данных успешно завершена!")
        )

    def clear_data(self):
        """Очищает все данные."""
        Attachment.objects.all().delete()
        CourseVideo.objects.all().delete()
        Course.objects.all().delete()
        Video.objects.all().delete()
        News.objects.all().delete()
        University.objects.all().delete()
        Career.objects.all().delete()
        Characteristic.objects.all().delete()
        Employee.objects.all().delete()
        StructuralSubdivision.objects.all().delete()
        Organization.objects.all().delete()
        Competence.objects.all().delete()
        self.stdout.write(self.style.SUCCESS("Данные успешно очищены"))

    def create_admin_user(self):
        """Создает суперпользователя."""
        if Employee.objects.filter(username="admin").exists():
            self.stdout.write(self.style.WARNING("Пользователь admin уже существует"))
            return

        admin = Employee.objects.create_superuser(
            username="admin",
            email="admin@example.com",
            password="admin",
            name="Администратор",
            surname="Системы",
            patronym="",
        )
        self.stdout.write(
            self.style.SUCCESS(
                f"Создан суперпользователь: {admin.username} (пароль: admin)"
            )
        )

    def create_organizations(self):
        """Создает организации."""
        orgs_data = [
            {"name": "ЦА ФАВР", "address": "Москва, Кедрова 8к1"},
            {"name": "Ленское БВУ", "address": "Якутск, Курашова 28/3"},
        ]

        orgs = []
        for data in orgs_data:
            org, created = Organization.objects.get_or_create(
                name=data["name"],
                defaults={"address": data.get("address", "")},
            )
            orgs.append(org)

        return orgs

    def create_org_structure(self, org):
        """Создает структуру подразделений и сотрудников для организации."""
        employees = []

        # Структура для ЦА ФАВР
        if "ФАВР" in org.name:
            # Руководство
            head_subdiv = StructuralSubdivision.objects.create(
                name="Руководство",
                organization=org,
            )
            head = self.create_employee(None, head_subdiv, boss_title="Директор")
            employees.append(head)
            head_subdiv.chief = head
            head_subdiv.save()

            # Управление гидрологии
            hydro_dept = StructuralSubdivision.objects.create(
                name="Управление гидрологии и мониторинга",
                organization=org,
                parent_structural_subdivision=head_subdiv,
            )
            hydro_boss = self.create_employee(
                head.id, hydro_dept, boss_title="Начальник управления"
            )
            employees.append(hydro_boss)
            hydro_dept.chief = hydro_boss
            hydro_dept.save()

            # Отделы управления гидрологии
            for dept_name in [
                "Отдел мониторинга качества воды",
                "Отдел гидрологических прогнозов",
            ]:
                dept = StructuralSubdivision.objects.create(
                    name=dept_name,
                    organization=org,
                    parent_structural_subdivision=hydro_dept,
                )
                dept_boss = self.create_employee(
                    hydro_boss.id, dept, boss_title=random.choice(BOSS_TITLES)
                )
                employees.append(dept_boss)
                dept.chief = dept_boss
                dept.save()

                # Сотрудники отдела
                for _ in range(random.randint(MIN_COWORKERS, MAX_COWORKERS)):
                    emp = self.create_employee(dept_boss.id, dept)
                    employees.append(emp)

        # Структура для Ленского БВУ
        else:
            # Руководство
            head_subdiv = StructuralSubdivision.objects.create(
                name="Руководство",
                organization=org,
            )
            head = self.create_employee(None, head_subdiv, boss_title="Начальник БВУ")
            employees.append(head)
            head_subdiv.chief = head
            head_subdiv.save()

            # Отделы
            for dept_name in [
                "Отдел водоснабжения и водоотведения",
                "Отдел научных исследований и инноваций",
            ]:
                dept = StructuralSubdivision.objects.create(
                    name=dept_name,
                    organization=org,
                    parent_structural_subdivision=head_subdiv,
                )
                dept_boss = self.create_employee(
                    head.id, dept, boss_title=random.choice(BOSS_TITLES)
                )
                employees.append(dept_boss)
                dept.chief = dept_boss
                dept.save()

                # Сотрудники отдела
                for _ in range(random.randint(MIN_COWORKERS, MAX_COWORKERS)):
                    emp = self.create_employee(dept_boss.id, dept)
                    employees.append(emp)

        return employees

    def create_employee(self, chief_id, subdiv, boss_title=None):
        """Создает сотрудника."""
        sex = "male" if random.random() < MALE_CHANCE else "female"
        names_dict = MALE_NAMES if sex == "male" else FEMALE_NAMES

        surname = random.choice(names_dict["surnames"])
        name = random.choice(names_dict["names"])
        patronym = random.choice(names_dict["patronyms"])

        email = ru_to_latin(surname + name[0] + patronym[0]) + "@" + EMAIL_DOMAIN

        # Если email уже существует, добавляем случайное число
        if Employee.objects.filter(email=email).exists():
            email = (
                ru_to_latin(surname + name[0] + patronym[0])
                + str(random.randint(1, 999))
                + "@"
                + EMAIL_DOMAIN
            )

        birth_date = random_date_between(BIRTH_DATE_MIN, BIRTH_DATE_MAX)

        career_path = random.choice(CAREER_PATHS).copy()
        if boss_title:
            career_path.append(boss_title)

        employee = Employee.objects.create(
            id=str(uuid4()),
            username=email,
            email=email,
            password=PASSWORD,
            surname=surname,
            name=name,
            patronym=patronym,
            birth_date=birth_date,
            sex="Мужской" if sex == "male" else "Женский",
            job_title=career_path[-1],
            class_rank=f"Советник {random.randint(1, 6)} ранга",
            status=random.choice(STATUSES),
            telephone_number=f"+7{random.randint(800_000_00_00, 999_999_99_99)}",
            inner_telephone_number=f"{random.randint(0, 99):02d}-{random.randint(0, 99):02d}",
            office=f"к. {random.randint(100, 1000)}",
            structural_division=subdiv,
            chief_id=chief_id,
            is_staff=True,
            is_active=True,
            agreed_with_data_processing=False,
        )

        return employee

    def create_competences(self):
        """Создает компетенции."""
        competences = []
        for skill in SKILLS:
            comp, created = Competence.objects.get_or_create(
                name=skill,
                defaults={"is_important": False},
            )
            competences.append(comp)
        return competences

    def create_characteristics(self, employees, competences):
        """Создает характеристики для сотрудников."""
        count = 0
        for employee in employees:
            age = CURRENT_YEAR - employee.birth_date.year
            experience = max(0, age - WORKING_AGE)

            char = Characteristic.objects.create(
                employee=employee,
                experience=f"{experience} лет" if experience > 0 else "без опыта",
                about=" ".join(
                    random.sample(ABOUT_SENTENCES, k=min(3, len(ABOUT_SENTENCES)))
                ),
            )

            # Добавляем компетенции
            employee_skills = random.sample(
                competences, k=min(random.randint(3, 7), len(competences))
            )
            char.competences.set(employee_skills)

            # Создаем карьерный путь
            career_years = []
            y0 = employee.birth_date.year + WORKING_AGE
            for i in range(random.randint(1, 3)):
                year_start = y0 + i * random.randint(2, 5)
                year_finish = year_start + random.randint(2, 5) if i < 2 else None
                career_years.append((year_start, year_finish))

            for year_start, year_finish in career_years:
                Career.objects.create(
                    characteristic=char,
                    name=random.choice(
                        ["Специалист", "Старший специалист", "Ведущий специалист"]
                    ),
                    year_start=year_start,
                    year_finish=year_finish,
                )

            # Создаем университет
            uni_name = random.choice(list(UNIVERSITIES.keys()))
            University.objects.create(
                characteristic=char,
                name=uni_name,
                faculty=random.choice(UNIVERSITIES[uni_name]),
                year=employee.birth_date.year + WORKING_AGE + random.randint(-2, 2),
                file="",
            )

            count += 1

        return count

    def create_news(self, employees, orgs):
        """Создает новости."""
        news_data = [
            {
                "title": "Ленское БВУ участвовало в забеге «Беги Форест, беги»",
                "text": "Ленское БВУ приняло участие в забеге «Беги, Форест, беги». Сотрудники бассейного водного управления присоединились к мероприятию, чтобы поддержать здоровый образ жизни и привлечь внимание к проблемам экологии.",
            },
            {
                "title": "Совещание по вопросам водопользования",
                "text": "В ЦА ФАВР прошло совещание с представителями региональных управлений по вопросам рационального водопользования и охраны водных ресурсов.",
            },
            {
                "title": "Мониторинг качества воды в реках региона",
                "text": "Специалисты отдела мониторинга провели плановую проверку качества воды в основных реках региона. Результаты соответствуют нормативам.",
            },
        ]

        count = 0
        today = timezone.now()
        prev_date = today - timedelta(days=365)

        for i in range(12):
            data = random.choice(news_data)
            pub_date = random_date_between(prev_date.date(), today.date())
            prev_date = timezone.datetime.combine(
                pub_date, timezone.datetime.min.time()
            )
            prev_date = timezone.make_aware(prev_date)

            news = News.objects.create(
                title=f"({i + 1}) {data['title']}",
                text=data["text"],
                author=random.choice(employees) if employees else None,
                pub_date=prev_date,
                is_published=True,
            )

            # Добавляем организацию
            news.organization.set([random.choice(orgs)])

            count += 1

        return count

    def create_educational_content(self, employees):
        """Создает обучающие видео и курсы."""
        videos = []

        video_data = [
            {
                "name": "Основы гидрологического мониторинга",
                "description": "Введение в методы мониторинга водных объектов",
            },
            {
                "name": "Экологическая безопасность водных ресурсов",
                "description": "Принципы и методы обеспечения экологической безопасности",
            },
            {
                "name": "Управление водными ресурсами",
                "description": "Современные подходы к управлению водными ресурсами",
            },
        ]

        now = timezone.now()

        for data in video_data:
            video = Video.objects.create(
                name=data["name"],
                description=data["description"],
                author=random.choice(employees) if employees else None,
                pub_date=now - timedelta(days=random.randint(30, 180)),
                is_published=True,
            )
            videos.append(video)

        # Создаем курс
        courses = []
        if videos:
            course = Course.objects.create(
                name="Профессиональное развитие специалиста водного хозяйства",
                description="Комплексный курс для повышения квалификации сотрудников",
                author=random.choice(employees) if employees else None,
                pub_date=now - timedelta(days=30),
                is_published=True,
            )
            courses.append(course)

            # Добавляем видео в курс
            for order, video in enumerate(videos, start=1):
                CourseVideo.objects.create(
                    course=course,
                    video=video,
                    order=order,
                )

        return videos, courses
