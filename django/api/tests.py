from datetime import timedelta

from django.test import override_settings
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase, APIRequestFactory
from django.contrib.auth.models import AnonymousUser

from employees.models import (
    Competence,
    Employee,
    FavoriteSegment,
    Idea,
    Organization,
    Rating,
    Segment,
    SegmentGroup,
    StructuralSubdivision,
)
from homepage.constants import MAX_FAVORITE_SEGMENTS
from homepage.models import News, PollGroup


@override_settings(
    AUTHENTICATION_BACKENDS=["django.contrib.auth.backends.ModelBackend"],
    FORCE_SCRIPT_NAME="",
)
class RatingAPITests(APITestCase):
    """
    Тесты для API оценок сотрудников.

    Проверяет функциональность создания, обновления и удаления оценок сотрудников,
    включая валидацию бизнес-правил (нельзя оценить себя, нельзя оценить дважды).
    """

    def setUp(self):
        """
        Настраиваем тестовое окружение: создаем двух пользователей
        и аутентифицируем одного из них.
        """
        self.user = Employee.objects.create_user(
            username="main_user", password="testpassword123", email="main@example.com",
        )
        self.other_employee = Employee.objects.create_user(
            username="other_employee",
            password="testpassword123",
            email="other@example.com",
        )

        self.client.force_authenticate(user=self.user)

    def test_create_rating_successfully(self):
        """
        Тест: Успешное создание новой оценки для другого сотрудника (POST).

        Проверяет, что:
        - Запрос возвращает статус 201 Created
        - Оценка создается в базе данных
        - Возвращается корректное сообщение об успехе
        """

        url = f"/api/colleagues/{self.other_employee.pk}/rate/"
        rating_data = {"rate": 5, "text": "Отличная работа!"}

        response = self.client.post(url, rating_data, format="json")

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
            f"Ожидался статус 201, получен {response.status_code}. Ответ: {response.data}",
        )

        rating_exists = Rating.objects.filter(
            user=self.user, employee=self.other_employee,
        ).exists()
        self.assertTrue(rating_exists, "Оценка не была создана в базе данных")

        self.assertEqual(
            response.data["message"],
            "Вы успешно оценили сотрудника.",
            f"Неверное сообщение об успехе: {response.data.get('message')}",
        )

    def test_create_duplicate_rating_fails(self):
        """
        Тест: Попытка создать вторую оценку тому же сотруднику должна провалиться (POST).

        Проверяет, что:
        - Запрос возвращает статус 400 Bad Request
        - В ответе содержится соответствующее сообщение об ошибке
        - Дублирующая оценка не создается в базе данных
        """
        Rating.objects.create(user=self.user, employee=self.other_employee, rate=4)

        url = f"/api/colleagues/{self.other_employee.pk}/rate/"
        rating_data = {"rate": 5, "text": "Пытаюсь оценить снова."}

        response = self.client.post(url, rating_data, format="json")

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
            f"Ожидался статус 400, получен {response.status_code}. Ответ: {response.data}",
        )

        error_message = str(response.data)
        self.assertIn(
            "Нельзя оценивать одного сотрудника дважды",
            error_message,
            f"Ожидалось сообщение о запрете повторной оценки, получено: {error_message}",
        )

        # Проверяем, что в базе все еще только одна оценка
        ratings_count = Rating.objects.filter(
            user=self.user, employee=self.other_employee,
        ).count()
        self.assertEqual(
            ratings_count,
            1,
            f"Ожидалась 1 оценка в базе данных, найдено: {ratings_count}",
        )

    def test_update_existing_rating_successfully(self):
        """
        Тест: Пользователь успешно обновляет свою существующую оценку (PUT).

        Проверяет, что:
        - Запрос возвращает статус 200 OK
        - Оценка обновляется в базе данных
        - Возвращается корректное сообщение об успехе
        """
        rating_instance = Rating.objects.create(
            user=self.user,
            employee=self.other_employee,
            rate=3,
            text="Первоначальная оценка",
        )
        url = f"/api/colleagues/{self.other_employee.pk}/rate/"
        update_data = {"rate": 5, "text": "Оценка обновлена!"}

        response = self.client.put(url, update_data, format="json")

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
            f"Ожидался статус 200, получен {response.status_code}. Ответ: {response.data}",
        )

        rating_instance.refresh_from_db()
        self.assertEqual(
            rating_instance.rate,
            5,
            f"Ожидалась оценка 5, получена {rating_instance.rate}",
        )
        self.assertEqual(
            rating_instance.text,
            "Оценка обновлена!",
            f"Ожидался текст 'Оценка обновлена!', получен '{rating_instance.text}'",
        )
        self.assertEqual(
            response.data["message"],
            "Вы успешно обновили оценку.",
            f"Неверное сообщение об успехе: {response.data.get('message')}",
        )

    def test_update_non_existent_rating_fails_with_404(self):
        """
        Тест: Попытка обновить несуществующую оценку должна вернуть 404 (PUT).

        Проверяет, что:
        - Запрос возвращает статус 404 Not Found
        - В ответе содержится соответствующее сообщение об ошибке
        """
        url = f"/api/colleagues/{self.other_employee.pk}/rate/"
        update_data = {"rate": 4}

        # Убеждаемся, что оценки не существует
        rating_exists = Rating.objects.filter(
            user=self.user, employee=self.other_employee,
        ).exists()
        self.assertFalse(rating_exists, "Оценка не должна существовать для этого теста")

        response = self.client.put(url, update_data, format="json")

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
            f"Ожидался статус 404, получен {response.status_code}. Ответ: {response.data}",
        )

        error_message = str(response.data)
        self.assertIn(
            "Вы еще не ставили оценку этому сотруднику",
            error_message,
            f"Ожидалось сообщение о несуществующей оценке, получено: {error_message}",
        )

    def test_cannot_rate_self_post_fails(self):
        """
        Тест: Нельзя оценить самого себя через POST.
        """
        url = f"/api/colleagues/{self.user.pk}/rate/"
        rating_data = {"rate": 5}
        response = self.client.post(url, rating_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Вы не можете оценить самого себя", str(response.data))

    def test_delete_rating_successfully(self):
        """
        Тест: Успешное удаление существующей оценки (DELETE).
        """
        # Создаем оценку для удаления
        Rating.objects.create(user=self.user, employee=self.other_employee, rate=4)

        url = f"/api/colleagues/{self.other_employee.pk}/rate/"
        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(
            Rating.objects.filter(user=self.user, employee=self.other_employee).exists(),
        )
        self.assertEqual(response.data["message"], "Вы успешно удалили свою оценку.")

    def test_delete_non_existent_rating_fails(self):
        """
        Тест: Попытка удалить несуществующую оценку должна провалиться (DELETE).
        """
        url = f"/api/colleagues/{self.other_employee.pk}/rate/"

        # Убеждаемся, что оценки не существует
        self.assertFalse(
            Rating.objects.filter(user=self.user, employee=self.other_employee).exists(),
        )

        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_rate_another_employee_post_successfully(self):
        """
        Тест: Успешная оценка другого сотрудника через POST с минимальными данными.
        """
        url = f"/api/colleagues/{self.other_employee.pk}/rate/"
        rating_data = {"rate": 3}  # Только обязательное поле

        response = self.client.post(url, rating_data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            Rating.objects.filter(
                user=self.user, employee=self.other_employee, rate=3,
            ).exists(),
        )


@override_settings(
    AUTHENTICATION_BACKENDS=["django.contrib.auth.backends.ModelBackend"],
    FORCE_SCRIPT_NAME="",
)
class StructuralSubdivisionAPITests(APITestCase):
    """
    Тесты для API структурных подразделений.

    Проверяет функциональность CRUD операций для структурных подразделений,
    включая создание, получение, обновление и удаление подразделений,
    а также управление связями с руководителями и родительскими подразделениями.
    """

    def setUp(self):
        """
        Подготавливаем данные, которые будут использоваться в нескольких тестах.
        """
        self.user = Employee.objects.create_user(
            username="testuser", password="password123",
        )
        # Создаем администратора для операций создания/редактирования
        self.admin_user = Employee.objects.create_user(
            username="admin", password="password123", is_staff=True,
        )
        self.client.force_authenticate(
            user=self.admin_user,
        )  # Используем администратора по умолчанию

        self.organization = Organization.objects.create(name="Главная Организация")
        self.chief_employee = Employee.objects.create_user(
            username="chief", password="password123",
        )
        self.supervisor_employee = Employee.objects.create_user(
            username="supervisor", password="password123",
        )
        self.parent_subdivision = StructuralSubdivision.objects.create(
            name="Головной Департамент", organization=self.organization,
        )

    def test_create_subdivision(self):
        """
        Проверяем успешное создание нового структурного подразделения (POST).
        """
        url = "/api/subdivisions/"
        data = {
            "name": "Новый Отдел Разработки",
            "organization": self.organization.pk,
            "chief": self.chief_employee.pk,
            "supervisor": self.supervisor_employee.pk,
            "parent_structural_subdivision": self.parent_subdivision.pk,
        }

        response = self.client.post(url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            StructuralSubdivision.objects.filter(name="Новый Отдел Разработки").exists(),
        )
        self.assertEqual(response.data["name"], "Новый Отдел Разработки")
        self.assertEqual(response.data["chief"], self.chief_employee.pk)

    def setUp_for_update(self):
        """Вспомогательный метод, создающий объект для обновления в тестах"""
        return StructuralSubdivision.objects.create(
            name="Отдел для изменения",
            organization=self.organization,
            chief=self.chief_employee,
        )

    def test_update_name(self):
        """Проверяем изменение атрибута 'name'."""

        subdivision = self.setUp_for_update()
        url = f"/api/subdivisions/{subdivision.pk}/"
        new_name = "Измененное Название Отдела"
        data = {"name": new_name}

        response = self.client.patch(url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        subdivision.refresh_from_db()
        self.assertEqual(subdivision.name, new_name)

    def test_update_chief(self):
        """Проверяем изменение атрибута 'chief'."""

        subdivision = self.setUp_for_update()
        new_chief = Employee.objects.create_user(username="newchief")
        url = f"/api/subdivisions/{subdivision.pk}/"
        data = {"chief": new_chief.pk}

        response = self.client.patch(url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        subdivision.refresh_from_db()
        self.assertEqual(subdivision.chief, new_chief)

    def test_update_supervisor(self):
        """Проверяем изменение атрибута 'supervisor'."""

        subdivision = self.setUp_for_update()
        url = f"/api/subdivisions/{subdivision.pk}/"
        data = {"supervisor": self.supervisor_employee.pk}

        response = self.client.patch(url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        subdivision.refresh_from_db()
        self.assertEqual(subdivision.supervisor, self.supervisor_employee)

    def test_update_parent_subdivision(self):
        """Проверяем изменение атрибута 'parent_structural_subdivision'."""

        subdivision = self.setUp_for_update()
        url = f"/api/subdivisions/{subdivision.pk}/"
        data = {"parent_structural_subdivision": self.parent_subdivision.pk}

        response = self.client.patch(url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        subdivision.refresh_from_db()
        self.assertEqual(
            subdivision.parent_structural_subdivision, self.parent_subdivision,
        )

    def test_set_chief_to_null(self):
        """Проверяем возможность обнулить 'chief' (так как поле nullable)."""

        subdivision = self.setUp_for_update()
        url = f"/api/subdivisions/{subdivision.pk}/"
        data = {"chief": None}

        response = self.client.patch(url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        subdivision.refresh_from_db()
        self.assertIsNone(subdivision.chief)

    def test_delete_subdivision(self):
        """
        Проверяем успешное удаление структурного подразделения (DELETE).
        """

        subdivision_to_delete = StructuralSubdivision.objects.create(
            name="Отдел на удаление", organization=self.organization,
        )
        url = f"/api/subdivisions/{subdivision_to_delete.pk}/"

        self.assertTrue(
            StructuralSubdivision.objects.filter(pk=subdivision_to_delete.pk).exists(),
        )

        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(
            StructuralSubdivision.objects.filter(pk=subdivision_to_delete.pk).exists(),
        )

    def test_regular_user_cannot_create_subdivision(self):
        """
        Проверяем, что обычный пользователь не может создавать подразделения.
        """
        # Переключаемся на обычного пользователя
        self.client.force_authenticate(user=self.user)

        url = "/api/subdivisions/"
        data = {
            "name": "Попытка создать отдел",
            "organization": self.organization.pk,
        }

        response = self.client.post(url, data, format="json")

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
            "Обычный пользователь не должен иметь возможность создавать подразделения",
        )

    def test_regular_user_can_read_subdivisions(self):
        """
        Проверяем, что обычный пользователь может читать подразделения.
        """
        # Переключаемся на обычного пользователя
        self.client.force_authenticate(user=self.user)

        url = "/api/subdivisions/"
        response = self.client.get(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
            "Обычный пользователь должен иметь возможность читать подразделения",
        )


@override_settings(
    AUTHENTICATION_BACKENDS=["django.contrib.auth.backends.ModelBackend"],
    FORCE_SCRIPT_NAME="",
)
class NewsViewSetTests(APITestCase):
    """
    Тесты для API новостей.

    Проверяет функциональность получения новостей, включая:
    - Отображение только опубликованных новостей
    - Фильтрацию по организации
    - Получение отдельной новости
    """

    def setUp(self):
        self.user = Employee.objects.create_user(
            username="testuser", password="password123",
        )
        self.client.force_authenticate(user=self.user)

        self.organization = Organization.objects.create(name="Test Organization")

        # Create published news (fix many-to-many relationship)
        self.published_news = News.objects.create(
            title="Published News",
            text="This is published news content",
            is_published=True,
            pub_date=timezone.now() - timedelta(hours=1),
        )
        self.published_news.organization.set([self.organization])

        # Create unpublished news
        self.unpublished_news = News.objects.create(
            title="Unpublished News",
            text="This is unpublished news content",
            is_published=False,
            pub_date=timezone.now() - timedelta(hours=1),
        )
        self.unpublished_news.organization.set([self.organization])

    def test_list_news(self):
        """Тест: Получение списка новостей (только опубликованные)."""
        url = "/api/news/"
        response = self.client.get(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
            "Не удалось получить список новостей",
        )
        # Check if paginated or direct list
        if "results" in response.data:
            self.assertEqual(
                len(response.data["results"]),
                1,
                f"Ожидалась 1 опубликованная новость, получено: {len(response.data['results'])}",
            )  # Только опубликованные
            self.assertEqual(
                response.data["results"][0]["title"],
                "Published News",
                f"Заголовок новости не соответствует ожидаемому: {response.data['results'][0]['title']}",
            )
        else:
            self.assertEqual(
                len(response.data),
                1,
                f"Ожидалась 1 опубликованная новость, получено: {len(response.data)}",
            )
            self.assertEqual(
                response.data[0]["title"],
                "Published News",
                f"Заголовок новости не соответствует ожидаемому: {response.data[0]['title']}",
            )

    def test_retrieve_news(self):
        """Тест: Получение отдельной новости."""
        url = f"/api/news/{self.published_news.pk}/"
        response = self.client.get(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
            f"Не удалось получить новость с ID {self.published_news.pk}",
        )
        self.assertEqual(
            response.data["title"],
            "Published News",
            f"Заголовок новости не соответствует ожидаемому: {response.data['title']}",
        )

    def test_filter_news_by_organization(self):
        """Тест: Фильтрация новостей по организации."""
        url = f"/api/news/?organization__id={self.organization.pk}"
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Check if paginated or direct list
        if "results" in response.data:
            self.assertEqual(len(response.data["results"]), 1)
        else:
            self.assertEqual(len(response.data), 1)


@override_settings(
    AUTHENTICATION_BACKENDS=["django.contrib.auth.backends.ModelBackend"],
    FORCE_SCRIPT_NAME="",
)
class OrganizationViewSetTests(APITestCase):
    """
    Тесты для API организаций.

    Проверяет функциональность работы с организациями:
    - Получение списка организаций
    - Получение отдельной организации
    """

    def setUp(self):
        self.user = Employee.objects.create_user(
            username="testuser", password="password123",
        )
        self.client.force_authenticate(user=self.user)

        self.organization = Organization.objects.create(name="Test Organization")

    def test_list_organizations(self):
        """Тест: Получение списка организаций."""
        url = "/api/organization/"
        response = self.client.get(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
            "Не удалось получить список организаций",
        )
        # Check if paginated or direct list
        if "results" in response.data:
            self.assertTrue(
                len(response.data["results"]) >= 1,
                f"Список организаций пуст, ожидалось минимум 1: {len(response.data['results'])}",
            )
        else:
            self.assertTrue(
                len(response.data) >= 1,
                f"Список организаций пуст, ожидалось минимум 1: {len(response.data)}",
            )

    def test_retrieve_organization(self):
        """Тест: Получение отдельной организации."""
        url = f"/api/organization/{self.organization.pk}/"
        response = self.client.get(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
            f"Не удалось получить организацию с ID {self.organization.pk}",
        )
        self.assertEqual(
            response.data["name"],
            "Test Organization",
            f"Название организации не соответствует ожидаемому: {response.data['name']}",
        )


@override_settings(
    AUTHENTICATION_BACKENDS=["django.contrib.auth.backends.ModelBackend"],
    FORCE_SCRIPT_NAME="",
)
class CompetenceListViewTests(APITestCase):
    """
    Тесты для API компетенций.

    Проверяет функциональность работы с компетенциями:
    - Получение списка компетенций
    - Поиск компетенций по названию
    """

    def setUp(self):
        self.user = Employee.objects.create_user(
            username="testuser", password="password123",
        )
        self.client.force_authenticate(user=self.user)

        self.competence1 = Competence.objects.create(name="Python Development")
        self.competence2 = Competence.objects.create(name="JavaScript Development")

    def test_list_competences(self):
        """Тест: Получение списка компетенций."""
        url = "/api/competences/"
        response = self.client.get(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
            "Не удалось получить список компетенций",
        )
        # Check if paginated or direct list
        if "results" in response.data:
            self.assertTrue(
                len(response.data["results"]) >= 2,
                f"Ожидалось минимум 2 компетенции, получено: {len(response.data['results'])}",
            )
        else:
            self.assertTrue(
                len(response.data) >= 2,
                f"Ожидалось минимум 2 компетенции, получено: {len(response.data)}",
            )

    def test_search_competences(self):
        """Тест: Поиск компетенций по названию."""
        url = "/api/competences/?search=Python"
        response = self.client.get(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
            "Не удалось выполнить поиск компетенций",
        )
        # Check if paginated or direct list
        if "results" in response.data:
            self.assertEqual(
                len(response.data["results"]),
                1,
                f"Ожидалась 1 компетенция с 'Python', получено: {len(response.data['results'])}",
            )
            self.assertEqual(
                response.data["results"][0]["name"],
                "Python Development",
                f"Название компетенции не соответствует ожидаемому: {response.data['results'][0]['name']}",
            )
        else:
            self.assertEqual(
                len(response.data),
                1,
                f"Ожидалась 1 компетенция с 'Python', получено: {len(response.data)}",
            )
            self.assertEqual(
                response.data[0]["name"],
                "Python Development",
                f"Название компетенции не соответствует ожидаемому: {response.data[0]['name']}",
            )


@override_settings(
    AUTHENTICATION_BACKENDS=["django.contrib.auth.backends.ModelBackend"],
    FORCE_SCRIPT_NAME="",
)
class PollGroupListViewTests(APITestCase):
    """
    Тесты для API групп опросов.

    Проверяет функциональность работы с группами опросов:
    - Получение списка групп опросов
    - Поиск групп опросов по названию
    """

    def setUp(self):
        self.user = Employee.objects.create_user(
            username="testuser", password="password123",
        )
        self.client.force_authenticate(user=self.user)

        self.poll_group = PollGroup.objects.create(name="Test Poll Group")

    def test_list_poll_groups(self):
        """Тест: Получение списка групп опросов."""
        url = "/api/poll_groups/"
        response = self.client.get(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
            "Не удалось получить список групп опросов",
        )
        # Check if paginated or direct list
        if "results" in response.data:
            self.assertTrue(
                len(response.data["results"]) >= 1,
                f"Список групп опросов пуст, ожидалось минимум 1: {len(response.data['results'])}",
            )
        else:
            self.assertTrue(
                len(response.data) >= 1,
                f"Список групп опросов пуст, ожидалось минимум 1: {len(response.data)}",
            )

    def test_search_poll_groups(self):
        """Тест: Поиск групп опросов по названию."""
        url = "/api/poll_groups/?search=Test"
        response = self.client.get(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
            "Не удалось выполнить поиск групп опросов",
        )
        # Check if paginated or direct list
        if "results" in response.data:
            self.assertEqual(
                len(response.data["results"]),
                1,
                f"Ожидалась 1 группа опросов с 'Test', получено: {len(response.data['results'])}",
            )
        else:
            self.assertEqual(
                len(response.data),
                1,
                f"Ожидалась 1 группа опросов с 'Test', получено: {len(response.data)}",
            )


@override_settings(
    AUTHENTICATION_BACKENDS=["django.contrib.auth.backends.ModelBackend"],
    FORCE_SCRIPT_NAME="",
)
class AgreeWithDataProcessingViewTests(APITestCase):
    """
    Тесты для API согласия на обработку данных.

    Проверяет функциональность работы с согласием на обработку персональных данных:
    - Подтверждение согласия на обработку данных
    """

    def setUp(self):
        self.user = Employee.objects.create_user(
            username="testuser", password="password123",
        )
        self.client.force_authenticate(user=self.user)

    def test_agree_with_data_processing(self):
        """Тест: Согласие на обработку персональных данных."""
        url = "/api/agree_with_data_processing/"

        # Убеждаемся, что изначально согласие не дано
        self.assertFalse(self.user.agreed_with_data_processing)

        response = self.client.post(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
            "Не удалось подтвердить согласие на обработку данных",
        )
        self.assertEqual(
            response.data["message"],
            "Согласие на обрабокту персональных данных отправлено.",
            f"Сообщение о согласии не соответствует ожидаемому: {response.data['message']}",
        )

        # Проверяем, что согласие было сохранено
        self.user.refresh_from_db()
        self.assertTrue(
            self.user.agreed_with_data_processing,
            "Согласие на обработку данных не было сохранено",
        )


@override_settings(
    AUTHENTICATION_BACKENDS=["django.contrib.auth.backends.ModelBackend"],
    FORCE_SCRIPT_NAME="",
)
class FileUploadAPIViewTests(APITestCase):
    """
    Тесты для API загрузки файлов.

    Проверяет функциональность загрузки файлов:
    - Обработка ошибок при отсутствии файла
    - Валидация загружаемых файлов
    """

    def setUp(self):
        self.user = Employee.objects.create_user(
            username="testuser", password="password123",
        )
        self.client.force_authenticate(user=self.user)

    def test_file_upload_without_file(self):
        """Тест: Попытка загрузки без файла должна провалиться."""
        url = "/api/upload-file/"
        data = {}

        response = self.client.post(url, data, format="multipart")

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
            "Ожидалась ошибка 400 при загрузке без файла",
        )


@override_settings(
    AUTHENTICATION_BACKENDS=["django.contrib.auth.backends.ModelBackend"],
    FORCE_SCRIPT_NAME="",
)
class OrgStructureViewsetTests(APITestCase):
    """
    Тесты для API организационной структуры.

    Проверяет функциональность работы с организационной структурой:
    - Получение списка элементов организационной структуры
    """

    def setUp(self):
        self.user = Employee.objects.create_user(
            username="testuser", password="password123",
        )
        self.client.force_authenticate(user=self.user)

    def test_list_org_structure(self):
        """Тест: Получение организационной структуры."""
        url = "/api/org-structure/"
        response = self.client.get(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
            "Не удалось получить список организационной структуры",
        )

    def test_retrieve_org_structure_employee(self):
        """Тест: Получение данных сотрудника в орг. структуре."""
        url = f"/api/org-structure/{self.user.pk}/"
        response = self.client.get(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
            f"Не удалось получить данные сотрудника с ID {self.user.pk} в орг. структуре",
        )


@override_settings(
    AUTHENTICATION_BACKENDS=["django.contrib.auth.backends.ModelBackend"],
    FORCE_SCRIPT_NAME="",
)
class HierarchyViewSetTests(APITestCase):
    def setUp(self):
        self.user = Employee.objects.create_user(
            username="testuser", password="password123",
        )
        self.client.force_authenticate(user=self.user)

        self.organization = Organization.objects.create(name="Test Organization")

    def test_list_hierarchy(self):
        """Тест: Получение иерархии организаций."""
        url = "/api/hierarchy/"
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_retrieve_hierarchy(self):
        """Тест: Получение иерархии конкретной организации."""
        url = f"/api/hierarchy/{self.organization.pk}/"
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)


@override_settings(
    AUTHENTICATION_BACKENDS=["django.contrib.auth.backends.ModelBackend"],
    FORCE_SCRIPT_NAME="",
)
class IdeaViewSetTests(APITestCase):
    """
    Тесты для API идей.

    Проверяет функциональность работы с идеями:
    - Получение списка идей
    - Получение отдельной идеи
    - Создание новых идей
    """

    def setUp(self):
        self.user = Employee.objects.create_user(
            username="testuser", password="password123",
        )
        self.other_user = Employee.objects.create_user(
            username="otheruser", password="password123",
        )
        self.client.force_authenticate(user=self.user)

        # Создаем идею от текущего пользователя, чтобы он мог её видеть
        self.idea = Idea.objects.create(
            text="This is a test idea",
            author=self.user,  # Изменили с other_user на self.user
        )

        # Создаем идею от другого пользователя для тестов доступа
        self.other_idea = Idea.objects.create(
            text="Other user's idea", author=self.other_user,
        )

    def test_list_ideas(self):
        """Тест: Получение списка идей."""
        url = "/api/ideas/"
        response = self.client.get(url)

        self.assertEqual(
            response.status_code, status.HTTP_200_OK, "Не удалось получить список идей",
        )
        # Check if paginated or direct list
        if "results" in response.data:
            self.assertTrue(
                len(response.data["results"]) >= 1,
                f"Список идей пуст, ожидалось минимум 1: {len(response.data['results'])}",
            )
        else:
            self.assertTrue(
                len(response.data) >= 1,
                f"Список идей пуст, ожидалось минимум 1: {len(response.data)}",
            )

    def test_retrieve_idea(self):
        """Тест: Получение отдельной идеи."""
        url = f"/api/ideas/{self.idea.pk}/"
        response = self.client.get(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
            f"Не удалось получить идею с ID {self.idea.pk}",
        )
        self.assertEqual(
            response.data["text"],
            "This is a test idea",
            f"Текст идеи не соответствует ожидаемому: {response.data['text']}",
        )

    def test_create_idea(self):
        """Тест: Создание новой идеи."""
        url = "/api/ideas/"
        data = {"text": "This is a new idea"}

        response = self.client.post(url, data, format="json")

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
            "Не удалось создать новую идею",
        )
        self.assertEqual(
            response.data["text"],
            "This is a new idea",
            f"Текст созданной идеи не соответствует ожидаемому: {response.data['text']}",
        )
        self.assertEqual(
            response.data["author"],
            self.user.pk,
            f"Автор идеи не соответствует ожидаемому: {response.data['author']}",
        )
        self.assertEqual(
            response.data["status"],
            "Получено",
            f"Статус новой идеи должен быть 'Получено': {response.data['status']}",
        )
        self.assertTrue(
            Idea.objects.filter(text="This is a new idea", author=self.user).exists(),
            "Идея не была сохранена в базе данных",
        )

    def test_create_idea_with_status_and_resolution(self):
        """Тест: Проверка, что обычный пользователь не может устанавливать статус и резолюцию при создании."""
        url = "/api/ideas/"
        data = {
            "text": "Idea with custom status",
            "status": "Одобрено",
            "resolution": "Custom resolution",
        }

        response = self.client.post(url, data, format="json")

        self.assertEqual(
            response.status_code, status.HTTP_201_CREATED, "Не удалось создать идею",
        )
        # Статус должен остаться по умолчанию, несмотря на попытку его изменить
        self.assertEqual(
            response.data["status"],
            "Получено",
            f"Статус должен быть 'Получено' по умолчанию: {response.data['status']}",
        )

    def test_user_can_edit_own_idea_text(self):
        """Тест: Пользователь может редактировать текст своей идеи."""
        # Создаем идею от текущего пользователя
        my_idea = Idea.objects.create(text="My original idea", author=self.user)

        url = f"/api/ideas/{my_idea.pk}/"
        data = {"text": "My updated idea"}

        response = self.client.patch(url, data, format="json")

        self.assertEqual(
            response.status_code, status.HTTP_200_OK, "Не удалось обновить свою идею",
        )
        self.assertEqual(
            response.data["text"],
            "My updated idea",
            f"Текст идеи не был обновлен: {response.data['text']}",
        )

    def test_user_cannot_edit_status_of_own_idea(self):
        """Тест: Обычный пользователь не может изменять статус своей идеи."""
        # Создаем идею от текущего пользователя
        my_idea = Idea.objects.create(text="My idea for status test", author=self.user)

        url = f"/api/ideas/{my_idea.pk}/"
        data = {"status": "Одобрено"}

        response = self.client.patch(url, data, format="json")

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
            "Обычный пользователь не должен иметь возможность изменять статус",
        )

    def test_user_cannot_edit_others_idea(self):
        """Тест: Пользователь не может редактировать чужую идею."""
        url = f"/api/ideas/{self.other_idea.pk}/"
        data = {"text": "Trying to edit someone else's idea"}

        response = self.client.patch(url, data, format="json")

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
            "Пользователь не должен иметь доступ к чужой идее (404, так как он её не видит)",
        )

    def test_staff_can_edit_others_idea(self):
        """Тест: Администратор может редактировать чужие идеи."""
        # Создаем администратора
        admin_user = Employee.objects.create_user(
            username="admin", password="password123", is_staff=True,
        )
        self.client.force_authenticate(user=admin_user)

        url = f"/api/ideas/{self.other_idea.pk}/"
        data = {"text": "Admin editing someone else's idea"}

        response = self.client.patch(url, data, format="json")

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
            "Администратор должен иметь возможность редактировать любые идеи",
        )
        self.assertEqual(
            response.data["text"],
            "Admin editing someone else's idea",
            f"Текст идеи не был обновлен: {response.data['text']}",
        )

    def test_staff_can_update_idea_status_and_resolution(self):
        """Тест: Администратор может изменять статус и резолюцию идеи."""
        # Создаем администратора
        admin_user = Employee.objects.create_user(
            username="admin", password="password123", is_staff=True,
        )
        self.client.force_authenticate(user=admin_user)

        # Используем any existing idea (администратор видит все идеи)
        url = f"/api/ideas/{self.idea.pk}/"
        data = {
            "status": "Одобрено",
            "resolution": "Отличная идея! Принимается к реализации.",
        }

        response = self.client.patch(url, data, format="json")

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
            "Администратор должен иметь возможность обновить статус",
        )
        self.assertEqual(
            response.data["status"],
            "Одобрено",
            f"Статус не был обновлен: {response.data['status']}",
        )
        self.assertEqual(
            response.data["resolution"],
            "Отличная идея! Принимается к реализации.",
            f"Резолюция не была обновлена: {response.data['resolution']}",
        )

    def test_filter_ideas_by_status(self):
        """Тест: Фильтрация идей по статусу."""
        # Создаем администратора для установки статуса
        admin_user = Employee.objects.create_user(
            username="admin", password="password123", is_staff=True,
        )

        # Создаем идею с одобренным статусом
        Idea.objects.create(
            text="Approved idea", author=self.user, status="Одобрено",
        )

        self.client.force_authenticate(user=admin_user)

        url = "/api/ideas/?status=Одобрено"
        response = self.client.get(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
            "Не удалось отфильтровать идеи по статусу",
        )

        # Проверяем результат
        if "results" in response.data:
            ideas = response.data["results"]
        else:
            ideas = response.data

        # Убеждаемся, что все возвращенные идеи имеют статус "Одобрено"
        for idea in ideas:
            self.assertEqual(
                idea["status"],
                "Одобрено",
                f"Найдена идея с неправильным статусом: {idea['status']}",
            )

    def test_user_sees_only_own_ideas(self):
        """Тест: Обычный пользователь видит только свои идеи."""
        # Создаем идею от текущего пользователя
        Idea.objects.create(text="My private idea", author=self.user)

        url = "/api/ideas/"
        response = self.client.get(url)

        self.assertEqual(
            response.status_code, status.HTTP_200_OK, "Не удалось получить список идей",
        )

        if "results" in response.data:
            ideas = response.data["results"]
        else:
            ideas = response.data

        # Все идеи должны принадлежать текущему пользователю
        for idea in ideas:
            self.assertEqual(
                idea["author"],
                self.user.pk,
                f"Пользователь видит чужую идею: автор {idea['author']}",
            )

    def test_staff_sees_all_ideas(self):
        """Тест: Администратор видит все идеи."""
        # Создаем администратора
        admin_user = Employee.objects.create_user(
            username="admin", password="password123", is_staff=True,
        )
        self.client.force_authenticate(user=admin_user)

        url = "/api/ideas/"
        response = self.client.get(url)

        self.assertEqual(
            response.status_code, status.HTTP_200_OK, "Не удалось получить список идей",
        )

        if "results" in response.data:
            ideas_count = len(response.data["results"])
        else:
            ideas_count = len(response.data)

        # Администратор должен видеть все идеи (минимум 1 из setUp)
        self.assertGreaterEqual(
            ideas_count,
            1,
            f"Администратор должен видеть все идеи, получено: {ideas_count}",
        )


@override_settings(
    AUTHENTICATION_BACKENDS=["django.contrib.auth.backends.ModelBackend"],
    FORCE_SCRIPT_NAME="",
)
class SegmentAPITests(APITestCase):
    """
    Тесты для API сегментов.
    
    Проверяет функциональность CRUD операций для сегментов,
    включая права доступа и валидацию.
    """

    def setUp(self):
        """Настройка тестового окружения."""
        self.user = Employee.objects.create_user(
            username="regular_user",
            password="testpass123",
            email="user@example.com",
        )
        self.admin_user = Employee.objects.create_user(
            username="admin_user",
            password="adminpass123",
            email="admin@example.com",
            is_staff=True,
        )
        self.supervisor = Employee.objects.create_user(
            username="supervisor",
            password="supervisorpass123",
            email="supervisor@example.com",
        )
        
        # Создаем группу сегментов
        self.segment_group = SegmentGroup.objects.create(
            name="ПКИ",
            description="Группа для сегментов ПКИ",
        )
        
        # Создаем тестовый сегмент
        self.segment = Segment.objects.create(
            name="Тестовый сегмент",
            supervisor=self.supervisor,
            url="https://example.com",
            description="Описание тестового сегмента",
        )

    def test_create_segment_by_admin_success(self):
        """Тест: Успешное создание сегмента администратором (POST)."""
        self.client.force_authenticate(user=self.admin_user)
        
        data = {
            "name": "Новый сегмент",
            "supervisor": self.supervisor.id,
            "url": "https://newsegment.com",
            "description": "Описание нового сегмента",
        }
        
        response = self.client.post("/api/segments/", data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["name"], "Новый сегмент")
        self.assertEqual(response.data["supervisor"], self.supervisor.id)
        self.assertTrue(Segment.objects.filter(name="Новый сегмент").exists())

    def test_create_segment_by_regular_user_forbidden(self):
        """Тест: Обычный пользователь не может создавать сегменты (POST)."""
        self.client.force_authenticate(user=self.user)
        
        data = {
            "name": "Запрещенный сегмент",
            "supervisor": self.supervisor.id,
            "url": "https://forbidden.com",
            "description": "Это должно быть запрещено",
        }
        
        response = self.client.post("/api/segments/", data)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertFalse(
            Segment.objects.filter(name="Запрещенный сегмент").exists(),
        )

    def test_update_segment_by_admin_success(self):
        """Тест: Успешное обновление сегмента администратором (PUT)."""
        self.client.force_authenticate(user=self.admin_user)
        
        data = {
            "name": "Обновленный сегмент",
            "supervisor": self.supervisor.id,
            "url": "https://updated.com",
            "description": "Обновленное описание",
        }
        
        response = self.client.put(f"/api/segments/{self.segment.id}/", data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.segment.refresh_from_db()
        self.assertEqual(self.segment.name, "Обновленный сегмент")
        self.assertEqual(self.segment.url, "https://updated.com")

    def test_partial_update_segment_by_admin_success(self):
        """Тест: Успешное частичное обновление сегмента администратором (PATCH)."""
        self.client.force_authenticate(user=self.admin_user)
        
        data = {"name": "Частично обновленный сегмент"}
        
        response = self.client.patch(f"/api/segments/{self.segment.id}/", data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.segment.refresh_from_db()
        self.assertEqual(self.segment.name, "Частично обновленный сегмент")
        # Остальные поля должны остаться неизменными
        self.assertEqual(self.segment.supervisor, self.supervisor)

    def test_update_segment_by_regular_user_forbidden(self):
        """Тест: Обычный пользователь не может обновлять сегменты (PUT)."""
        self.client.force_authenticate(user=self.user)
        
        data = {
            "name": "Запрещенное обновление",
            "supervisor": self.supervisor.id,
            "url": "https://forbidden-update.com",
            "description": "Это должно быть запрещено",
        }
        
        response = self.client.put(f"/api/segments/{self.segment.id}/", data)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.segment.refresh_from_db()
        self.assertNotEqual(self.segment.name, "Запрещенное обновление")

    def test_delete_segment_by_admin_success(self):
        """Тест: Успешное удаление сегмента администратором (DELETE)."""
        self.client.force_authenticate(user=self.admin_user)
        
        segment_id = self.segment.id
        response = self.client.delete(f"/api/segments/{segment_id}/")
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Segment.objects.filter(id=segment_id).exists())

    def test_delete_segment_by_regular_user_forbidden(self):
        """Тест: Обычный пользователь не может удалять сегменты (DELETE)."""
        self.client.force_authenticate(user=self.user)
        
        segment_id = self.segment.id
        response = self.client.delete(f"/api/segments/{segment_id}/")
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertTrue(Segment.objects.filter(id=segment_id).exists())

    def test_list_segments_authenticated_user(self):
        """Тест: Получение списка сегментов аутентифицированным пользователем."""
        self.client.force_authenticate(user=self.user)
        
        response = self.client.get("/api/segments/")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Проверяем, что наш тестовый сегмент есть в списке
        segment_names = [segment["name"] for segment in response.data]
        self.assertIn("Тестовый сегмент", segment_names)

    def test_segment_has_is_favorite_field(self):
        """Тест: Сегмент содержит поле is_favorite в ответе."""
        self.client.force_authenticate(user=self.user)
        
        response = self.client.get(f"/api/segments/{self.segment.id}/")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("is_favorite", response.data)
        self.assertFalse(response.data["is_favorite"])

    def test_create_segment_with_new_fields(self):
        """Тест: Создание сегмента с новыми полями (status, segment_group, supervisor_fallback)."""
        self.client.force_authenticate(user=self.admin_user)
        
        data = {
            "name": "Новый сегмент",
            "status": "Активно",
            "segment_group": self.segment_group.id,
            "supervisor": self.supervisor.id,
            "supervisor_fallback": "Иванов Иван Иванович",
            "url": "https://newsegment.com",
            "description": "Описание нового сегмента",
        }
        
        response = self.client.post("/api/segments/", data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["name"], "Новый сегмент")
        self.assertEqual(response.data["status"], "Активно")
        self.assertEqual(response.data["segment_group"], self.segment_group.id)
        self.assertEqual(response.data["segment_group_name"], "ПКИ")
        self.assertEqual(response.data["supervisor"], self.supervisor.id)
        self.assertEqual(response.data["supervisor_fallback"], "Иванов Иван Иванович")

    def test_create_segment_with_supervisor_fallback_only(self):
        """Тест: Создание сегмента только с fallback-ответственным (без supervisor)."""
        self.client.force_authenticate(user=self.admin_user)
        
        data = {
            "name": "Сегмент без супервизора",
            "status": "В разработке",
            "supervisor_fallback": "Петров Петр Петрович",
            "description": "Ответственный не зарегистрирован в системе",
        }
        
        response = self.client.post("/api/segments/", data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["supervisor"], None)
        self.assertEqual(response.data["supervisor_fallback"], "Петров Петр Петрович")

    def test_filter_segments_by_status(self):
        """Тест: Фильтрация сегментов по статусу."""
        self.client.force_authenticate(user=self.user)
        
        # Создаем сегменты с разными статусами
        Segment.objects.create(name="Активный сегмент", status="Активно")
        Segment.objects.create(name="Архивный сегмент", status="Архив")
        Segment.objects.create(name="В разработке", status="В разработке")
        
        response = self.client.get("/api/segments/?status=Активно")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["name"], "Активный сегмент")

    def test_filter_segments_by_segment_group(self):
        """Тест: Фильтрация сегментов по группе."""
        self.client.force_authenticate(user=self.user)
        
        # Создаем сегменты в разных группах
        other_group = SegmentGroup.objects.create(name="Другая группа")
        
        Segment.objects.create(name="Сегмент ПКИ", segment_group=self.segment_group)
        Segment.objects.create(name="Другой сегмент", segment_group=other_group)
        Segment.objects.create(name="Без группы")
        
        response = self.client.get(f"/api/segments/?segment_group={self.segment_group.id}")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["name"], "Сегмент ПКИ")

    def test_search_segments_by_supervisor_fallback(self):
        """Тест: Поиск сегментов по fallback-ответственному."""
        self.client.force_authenticate(user=self.user)
        
        Segment.objects.create(
            name="Сегмент 1",
            supervisor_fallback="Иванов Иван",
        )
        Segment.objects.create(
            name="Сегмент 2",
            supervisor_fallback="Петров Петр",
        )
        
        response = self.client.get("/api/segments/?search=Иванов")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["name"], "Сегмент 1")

    def test_update_segment_status(self):
        """Тест: Обновление статуса сегмента (PATCH)."""
        self.client.force_authenticate(user=self.admin_user)
        
        segment = Segment.objects.create(
            name="Тестовый сегмент для обновления",
            status="В разработке",
        )
        
        data = {"status": "Активно"}
        response = self.client.patch(f"/api/segments/{segment.id}/", data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "Активно")
        
        segment.refresh_from_db()
        self.assertEqual(segment.status, "Активно")


@override_settings(
    AUTHENTICATION_BACKENDS=["django.contrib.auth.backends.ModelBackend"],
    FORCE_SCRIPT_NAME="",
)
class FavoriteSegmentAPITests(APITestCase):
    """
    Тесты для API избранных сегментов.
    
    Проверяет функциональность добавления/удаления сегментов в избранное,
    включая ограничения по количеству и права доступа.
    """

    def setUp(self):
        """Настройка тестового окружения."""
        self.user = Employee.objects.create_user(
            username="test_user",
            password="testpass123",
            email="testuser@example.com",
        )
        self.other_user = Employee.objects.create_user(
            username="other_user",
            password="otherpass123",
            email="otheruser@example.com",
        )
        
        # Создаем несколько сегментов для тестирования
        self.segments = []
        for i in range(MAX_FAVORITE_SEGMENTS + 2):  # Создаем больше максимума
            segment = Segment.objects.create(
                name=f"Сегмент {i+1}",
                description=f"Описание сегмента {i+1}",
                url=f"https://segment{i+1}.com",
            )
            self.segments.append(segment)

    def test_add_segment_to_favorites_success(self):
        """Тест: Успешное добавление сегмента в избранное (POST)."""
        self.client.force_authenticate(user=self.user)
        
        data = {"segment": self.segments[0].id}
        
        response = self.client.post("/api/favorite-segments/", data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            FavoriteSegment.objects.filter(
                user=self.user, segment=self.segments[0],
            ).exists(),
        )

    def test_add_segment_to_favorites_duplicate_error(self):
        """Тест: Нельзя добавить один сегмент в избранное дважды."""
        self.client.force_authenticate(user=self.user)
        
        # Сначала добавляем сегмент в избранное
        FavoriteSegment.objects.create(user=self.user, segment=self.segments[0])
        
        data = {"segment": self.segments[0].id}
        
        response = self.client.post("/api/favorite-segments/", data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("уже добавлен в избранное", str(response.data))

    def test_exceed_max_favorite_segments_limit(self):
        """Тест: Нельзя добавить больше MAX_FAVORITE_SEGMENTS сегментов."""
        self.client.force_authenticate(user=self.user)
        
        # Добавляем максимальное количество сегментов
        for i in range(MAX_FAVORITE_SEGMENTS):
            FavoriteSegment.objects.create(
                user=self.user, segment=self.segments[i],
            )
        
        # Пытаемся добавить еще один
        data = {"segment": self.segments[MAX_FAVORITE_SEGMENTS].id}
        
        response = self.client.post("/api/favorite-segments/", data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn(f"максимум {MAX_FAVORITE_SEGMENTS}", str(response.data))

    def test_remove_segment_from_favorites_success(self):
        """Тест: Успешное удаление сегмента из избранного (DELETE)."""
        self.client.force_authenticate(user=self.user)
        
        # Добавляем сегмент в избранное
        favorite = FavoriteSegment.objects.create(
            user=self.user, segment=self.segments[0],
        )
        
        response = self.client.delete(f"/api/favorite-segments/{favorite.id}/")
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(
            FavoriteSegment.objects.filter(
                user=self.user, segment=self.segments[0],
            ).exists(),
        )

    def test_toggle_favorite_segment_add(self):
        """Тест: Переключение избранного - добавление."""
        self.client.force_authenticate(user=self.user)
        
        response = self.client.post(
            f"/api/favorite-segments/toggle/{self.segments[0].id}/",
        )
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("добавлен в избранное", response.data["message"])
        self.assertTrue(response.data["is_favorite"])
        self.assertTrue(
            FavoriteSegment.objects.filter(
                user=self.user, segment=self.segments[0],
            ).exists(),
        )

    def test_toggle_favorite_segment_remove(self):
        """Тест: Переключение избранного - удаление."""
        self.client.force_authenticate(user=self.user)
        
        # Сначала добавляем в избранное
        FavoriteSegment.objects.create(user=self.user, segment=self.segments[0])
        
        response = self.client.post(
            f"/api/favorite-segments/toggle/{self.segments[0].id}/",
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("удален из избранного", response.data["message"])
        self.assertFalse(response.data["is_favorite"])
        self.assertFalse(
            FavoriteSegment.objects.filter(
                user=self.user, segment=self.segments[0],
            ).exists(),
        )

    def test_toggle_favorite_nonexistent_segment(self):
        """Тест: Переключение избранного для несуществующего сегмента."""
        self.client.force_authenticate(user=self.user)
        
        response = self.client.post("/api/favorite-segments/toggle/99999/")
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn("не найден", response.data["error"])

    def test_list_user_favorite_segments(self):
        """Тест: Получение списка избранных сегментов пользователя."""
        self.client.force_authenticate(user=self.user)
        
        # Добавляем несколько сегментов в избранное
        favorite1 = FavoriteSegment.objects.create(
            user=self.user, segment=self.segments[0],
        )
        favorite2 = FavoriteSegment.objects.create(
            user=self.user, segment=self.segments[1],
        )
        
        # Добавляем сегмент в избранное другому пользователю (не должен появиться)
        FavoriteSegment.objects.create(
            user=self.other_user, segment=self.segments[2],
        )
        
        response = self.client.get("/api/favorite-segments/")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        
        # Проверяем, что вернулись только наши избранные сегменты
        favorite_ids = [item["id"] for item in response.data]
        self.assertIn(favorite1.id, favorite_ids)
        self.assertIn(favorite2.id, favorite_ids)

    def test_favorite_segments_authentication_required(self):
        """Тест: Для работы с избранными сегментами нужна аутентификация."""
        response = self.client.get("/api/favorite-segments/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
        response = self.client.post("/api/favorite-segments/", {})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_can_only_access_own_favorites(self):
        """Тест: Пользователь может получить доступ только к своим избранным."""
        self.client.force_authenticate(user=self.user)
        
        # Создаем избранный сегмент для другого пользователя
        other_favorite = FavoriteSegment.objects.create(
            user=self.other_user, segment=self.segments[0],
        )
        
        # Пытаемся удалить чужой избранный сегмент
        response = self.client.delete(f"/api/favorite-segments/{other_favorite.id}/")
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        # Убеждаемся, что он не был удален
        self.assertTrue(
            FavoriteSegment.objects.filter(id=other_favorite.id).exists(),
        )

    def test_toggle_favorite_segment_functionality(self):
        """Тест: Функциональность переключения избранного сегмента."""
        self.client.force_authenticate(user=self.user)
        
        # Добавляем в избранное
        response = self.client.post(f"/api/favorite-segments/toggle/{self.segments[0].id}/")
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data["is_favorite"])
        self.assertTrue(
            FavoriteSegment.objects.filter(
                user=self.user,
                segment=self.segments[0],
            ).exists(),
        )
        
        # Убираем из избранного
        response = self.client.post(f"/api/favorite-segments/toggle/{self.segments[0].id}/")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data["is_favorite"])
        self.assertFalse(
            FavoriteSegment.objects.filter(
                user=self.user,
                segment=self.segments[0],
            ).exists(),
        )

    def test_segment_is_favorite_field_in_segments_list(self):
        """Тест: Поле is_favorite корректно показывается в списке сегментов."""
        self.client.force_authenticate(user=self.user)
        
        # Добавляем один сегмент в избранное
        FavoriteSegment.objects.create(user=self.user, segment=self.segments[0])
        
        response = self.client.get("/api/segments/")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Находим наши сегменты в ответе
        segment_data = {s["id"]: s for s in response.data}
        
        self.assertTrue(segment_data[self.segments[0].id]["is_favorite"])
        self.assertFalse(segment_data[self.segments[1].id]["is_favorite"])


@override_settings(
    AUTHENTICATION_BACKENDS=["django.contrib.auth.backends.ModelBackend"],
    FORCE_SCRIPT_NAME="",
)
class SegmentGroupAPITests(APITestCase):
    """
    Тесты для API групп сегментов.
    
    Проверяет функциональность CRUD операций для групп сегментов,
    включая права доступа и валидацию.
    """

    def setUp(self):
        """Настройка тестового окружения."""
        self.user = Employee.objects.create_user(
            username="regular_user",
            password="testpass123",
            email="user@example.com",
        )
        self.admin_user = Employee.objects.create_user(
            username="admin_user",
            password="adminpass123",
            email="admin@example.com",
            is_staff=True,
        )
        
        # Создаем тестовую группу сегментов
        self.segment_group = SegmentGroup.objects.create(
            name="ПКИ",
            description="Группа для сегментов ПКИ",
        )
        
        # Создаем сегменты в группе
        self.segment1 = Segment.objects.create(
            name="Сегмент 1",
            segment_group=self.segment_group,
            status="Активно",
        )
        self.segment2 = Segment.objects.create(
            name="Сегмент 2", 
            segment_group=self.segment_group,
            status="В разработке",
        )

    def test_create_segment_group_by_admin_success(self):
        """Тест: Успешное создание группы сегментов администратором (POST)."""
        self.client.force_authenticate(user=self.admin_user)
        
        data = {
            "name": "Новая группа",
            "description": "Описание новой группы",
        }
        
        response = self.client.post("/api/segment-groups/", data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["name"], "Новая группа")
        self.assertEqual(response.data["description"], "Описание новой группы")
        self.assertEqual(response.data["segments_count"], 0)
        self.assertTrue(SegmentGroup.objects.filter(name="Новая группа").exists())

    def test_create_segment_group_by_regular_user_forbidden(self):
        """Тест: Обычный пользователь не может создавать группы сегментов (POST)."""
        self.client.force_authenticate(user=self.user)
        
        data = {
            "name": "Запрещенная группа",
            "description": "Это должно быть запрещено",
        }
        
        response = self.client.post("/api/segment-groups/", data)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertFalse(
            SegmentGroup.objects.filter(name="Запрещенная группа").exists(),
        )

    def test_get_segment_group_list(self):
        """Тест: Получение списка групп сегментов (GET)."""
        self.client.force_authenticate(user=self.user)
        
        response = self.client.get("/api/segment-groups/")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["name"], "ПКИ")
        self.assertEqual(response.data[0]["segments_count"], 2)

    def test_get_segment_group_detail(self):
        """Тест: Получение детальной информации о группе сегментов (GET)."""
        self.client.force_authenticate(user=self.user)
        
        response = self.client.get(f"/api/segment-groups/{self.segment_group.id}/")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "ПКИ")
        self.assertEqual(response.data["description"], "Группа для сегментов ПКИ")
        self.assertEqual(response.data["segments_count"], 2)

    def test_update_segment_group_by_admin_success(self):
        """Тест: Успешное обновление группы сегментов администратором (PUT)."""
        self.client.force_authenticate(user=self.admin_user)
        
        data = {
            "name": "Обновленная ПКИ",
            "description": "Обновленное описание",
        }
        
        response = self.client.put(f"/api/segment-groups/{self.segment_group.id}/", data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Обновленная ПКИ")
        self.assertEqual(response.data["description"], "Обновленное описание")
        
        # Проверяем, что изменения сохранились в базе
        self.segment_group.refresh_from_db()
        self.assertEqual(self.segment_group.name, "Обновленная ПКИ")

    def test_partial_update_segment_group_by_admin_success(self):
        """Тест: Успешное частичное обновление группы сегментов администратором (PATCH)."""
        self.client.force_authenticate(user=self.admin_user)
        
        data = {
            "description": "Частично обновленное описание",
        }
        
        response = self.client.patch(f"/api/segment-groups/{self.segment_group.id}/", data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "ПКИ")  # Не изменилось
        self.assertEqual(response.data["description"], "Частично обновленное описание")

    def test_delete_segment_group_by_admin_success(self):
        """Тест: Успешное удаление группы сегментов администратором (DELETE)."""
        self.client.force_authenticate(user=self.admin_user)
        
        response = self.client.delete(f"/api/segment-groups/{self.segment_group.id}/")
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(
            SegmentGroup.objects.filter(id=self.segment_group.id).exists(),
        )

    def test_update_segment_group_by_regular_user_forbidden(self):
        """Тест: Обычный пользователь не может обновлять группы сегментов (PUT)."""
        self.client.force_authenticate(user=self.user)
        
        data = {
            "name": "Запрещенное обновление",
            "description": "Это должно быть запрещено",
        }
        
        response = self.client.put(f"/api/segment-groups/{self.segment_group.id}/", data)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_segment_group_by_regular_user_forbidden(self):
        """Тест: Обычный пользователь не может удалять группы сегментов (DELETE)."""
        self.client.force_authenticate(user=self.user)
        
        response = self.client.delete(f"/api/segment-groups/{self.segment_group.id}/")
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertTrue(
            SegmentGroup.objects.filter(id=self.segment_group.id).exists(),
        )

    def test_search_segment_groups(self):
        """Тест: Поиск групп сегментов по названию."""
        self.client.force_authenticate(user=self.user)
        
        # Создаем дополнительную группу
        SegmentGroup.objects.create(name="Другая группа", description="Другое описание")
        
        response = self.client.get("/api/segment-groups/?search=ПКИ")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["name"], "ПКИ")


@override_settings(
    AUTHENTICATION_BACKENDS=["django.contrib.auth.backends.ModelBackend"],
    FORCE_SCRIPT_NAME="",
)
class VideoAPITests(APITestCase):
    """
    Тесты для API видео.
    
    Проверяет функциональность CRUD операций для видео,
    включая лайки, просмотры, права доступа и валидацию.
    """

    def setUp(self):
        """Настройка тестового окружения."""
        from homepage.models import Video
        
        self.user = Employee.objects.create_user(
            username="regular_user",
            password="testpass123",
            email="user@example.com",
        )
        self.admin_user = Employee.objects.create_user(
            username="admin_user",
            password="adminpass123",
            email="admin@example.com",
            is_staff=True,
        )
        
        # Создаем тестовое видео
        self.video = Video.objects.create(
            name="Тестовое видео",
            description="Описание тестового видео",
            author=self.admin_user,
            pub_date=timezone.now() - timedelta(hours=1),
            is_published=True,
        )
        
        # Создаем неопубликованное видео
        self.unpublished_video = Video.objects.create(
            name="Неопубликованное видео",
            description="Это видео не опубликовано",
            author=self.admin_user,
            pub_date=timezone.now() - timedelta(hours=1),
            is_published=False,
        )

    def test_create_video_by_admin_success(self):
        """Тест: Успешное создание видео администратором (POST)."""
        from django.core.files.uploadedfile import SimpleUploadedFile
        
        self.client.force_authenticate(user=self.admin_user)
        
        # Создаем фиктивный видеофайл
        video_file = SimpleUploadedFile("test_video.mp4", b"file_content", content_type="video/mp4")
        
        data = {
            "name": "Новое видео",
            "description": "Описание нового видео",
            "pub_date": timezone.now().isoformat(),
            "is_published": True,
            "media": video_file,
        }
        
        response = self.client.post("/api/videos/", data, format="multipart")
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["name"], "Новое видео")
        self.assertEqual(response.data["author"], self.admin_user.pk)

    def test_create_video_by_regular_user_forbidden(self):
        """Тест: Обычный пользователь не может создавать видео (POST)."""
        self.client.force_authenticate(user=self.user)
        
        data = {
            "name": "Запрещенное видео",
            "description": "Это должно быть запрещено",
            "pub_date": timezone.now().isoformat(),
            "is_published": True,
        }
        
        response = self.client.post("/api/videos/", data, format="json")
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_list_videos_shows_only_published(self):
        """Тест: Обычный пользователь видит только опубликованные видео."""
        self.client.force_authenticate(user=self.user)
        
        response = self.client.get("/api/videos/")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Проверяем, что в ответе только опубликованное видео
        if "results" in response.data:
            videos = response.data["results"]
        else:
            videos = response.data
            
        video_names = [v["name"] for v in videos]
        self.assertIn("Тестовое видео", video_names)
        self.assertNotIn("Неопубликованное видео", video_names)

    def test_admin_sees_all_videos(self):
        """Тест: Администратор видит все видео, включая неопубликованные."""
        self.client.force_authenticate(user=self.admin_user)
        
        response = self.client.get("/api/videos/")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        if "results" in response.data:
            videos = response.data["results"]
        else:
            videos = response.data
            
        self.assertGreaterEqual(len(videos), 2)
        video_names = [v["name"] for v in videos]
        self.assertIn("Тестовое видео", video_names)
        self.assertIn("Неопубликованное видео", video_names)

    def test_retrieve_video_detail(self):
        """Тест: Получение детальной информации о видео."""
        self.client.force_authenticate(user=self.user)
        
        response = self.client.get(f"/api/videos/{self.video.pk}/")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Тестовое видео")
        self.assertIn("likes_count", response.data)
        self.assertIn("views_count", response.data)
        self.assertIn("comments_count", response.data)
        self.assertIn("is_liked_by_me", response.data)

    def test_update_video_by_admin_success(self):
        """Тест: Администратор может обновлять видео (PATCH)."""
        self.client.force_authenticate(user=self.admin_user)
        
        data = {
            "name": "Обновленное название",
            "description": "Обновленное описание",
        }
        
        response = self.client.patch(f"/api/videos/{self.video.pk}/", data, format="json")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.video.refresh_from_db()
        self.assertEqual(self.video.name, "Обновленное название")

    def test_update_video_by_regular_user_forbidden(self):
        """Тест: Обычный пользователь не может обновлять видео."""
        self.client.force_authenticate(user=self.user)
        
        data = {
            "name": "Попытка обновления",
            "description": "Это должно быть запрещено",
            "pub_date": self.video.pub_date.isoformat(),
            "is_published": True,
        }
        
        response = self.client.put(f"/api/videos/{self.video.pk}/", data, format="json")
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_video_by_admin_success(self):
        """Тест: Администратор может удалять видео (DELETE)."""
        from homepage.models import Video
        
        self.client.force_authenticate(user=self.admin_user)
        
        video_to_delete = Video.objects.create(
            name="Видео для удаления",
            description="Будет удалено",
            author=self.admin_user,
            pub_date=timezone.now(),
            is_published=True,
        )
        
        video_id = video_to_delete.pk
        response = self.client.delete(f"/api/videos/{video_id}/")
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Video.objects.filter(pk=video_id).exists())

    def test_delete_video_by_regular_user_forbidden(self):
        """Тест: Обычный пользователь не может удалять видео."""
        self.client.force_authenticate(user=self.user)
        
        response = self.client.delete(f"/api/videos/{self.video.pk}/")
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_like_video_success(self):
        """Тест: Пользователь может поставить лайк видео."""
        from homepage.models import Like
        
        self.client.force_authenticate(user=self.user)
        
        response = self.client.post(f"/api/videos/{self.video.pk}/like/")
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("Лайк добавлен", response.data["message"])
        self.assertTrue(response.data["is_liked"])
        self.assertTrue(
            Like.objects.filter(video=self.video, user=self.user).exists()
        )

    def test_like_video_twice_returns_message(self):
        """Тест: Повторный лайк возвращает сообщение, что лайк уже поставлен."""
        from homepage.models import Like
        
        self.client.force_authenticate(user=self.user)
        
        # Ставим первый лайк
        Like.objects.create(video=self.video, user=self.user)
        
        # Пытаемся поставить второй лайк
        response = self.client.post(f"/api/videos/{self.video.pk}/like/")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("уже поставили лайк", response.data["message"])
        self.assertTrue(response.data["is_liked"])
        
        # Проверяем, что лайк все еще один
        self.assertEqual(
            Like.objects.filter(video=self.video, user=self.user).count(), 1
        )

    def test_unlike_video_success(self):
        """Тест: Пользователь может убрать лайк с видео."""
        from homepage.models import Like
        
        self.client.force_authenticate(user=self.user)
        
        # Сначала ставим лайк
        Like.objects.create(video=self.video, user=self.user)
        
        response = self.client.delete(f"/api/videos/{self.video.pk}/unlike/")
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertIn("Лайк удален", response.data["message"])
        self.assertFalse(response.data["is_liked"])
        self.assertFalse(
            Like.objects.filter(video=self.video, user=self.user).exists()
        )

    def test_unlike_video_without_like_returns_error(self):
        """Тест: Попытка убрать несуществующий лайк возвращает ошибку."""
        self.client.force_authenticate(user=self.user)
        
        response = self.client.delete(f"/api/videos/{self.video.pk}/unlike/")
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn("не ставили лайк", response.data["error"])

    def test_register_video_view(self):
        """Тест: Регистрация просмотра видео."""
        from homepage.models import VideoView
        
        self.client.force_authenticate(user=self.user)
        
        initial_views_count = VideoView.objects.filter(video=self.video).count()
        
        response = self.client.post(f"/api/videos/{self.video.pk}/view/")
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("Просмотр зарегистрирован", response.data["message"])
        
        # Проверяем, что просмотр был создан
        self.assertEqual(
            VideoView.objects.filter(video=self.video, user=self.user).count(),
            initial_views_count + 1
        )

    def test_multiple_views_are_allowed(self):
        """Тест: Можно зарегистрировать несколько просмотров одного видео."""
        from homepage.models import VideoView
        
        self.client.force_authenticate(user=self.user)
        
        # Регистрируем первый просмотр
        self.client.post(f"/api/videos/{self.video.pk}/view/")
        
        # Регистрируем второй просмотр
        response = self.client.post(f"/api/videos/{self.video.pk}/view/")
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Проверяем, что оба просмотра зарегистрированы
        self.assertGreaterEqual(
            VideoView.objects.filter(video=self.video, user=self.user).count(), 2
        )

    def test_video_counts_in_response(self):
        """Тест: В ответе корректно отображаются счетчики лайков, просмотров и комментариев."""
        from homepage.models import Comment, Like, VideoView
        
        self.client.force_authenticate(user=self.user)
        
        # Создаем данные
        Like.objects.create(video=self.video, user=self.user)
        VideoView.objects.create(video=self.video, user=self.user)
        VideoView.objects.create(video=self.video, user=self.user)
        Comment.objects.create(video=self.video, user=self.user, text="Тестовый комментарий")
        
        response = self.client.get(f"/api/videos/{self.video.pk}/")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["likes_count"], 1)
        self.assertEqual(response.data["views_count"], 2)
        self.assertEqual(response.data["comments_count"], 1)
        self.assertTrue(response.data["is_liked_by_me"])

    def test_is_liked_by_me_false_when_not_liked(self):
        """Тест: Поле is_liked_by_me = False, если пользователь не ставил лайк."""
        self.client.force_authenticate(user=self.user)
        
        response = self.client.get(f"/api/videos/{self.video.pk}/")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data["is_liked_by_me"])

    def test_like_requires_authentication(self):
        """Тест: Для постановки лайка требуется аутентификация."""
        response = self.client.post(f"/api/videos/{self.video.pk}/like/")
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_view_requires_authentication(self):
        """Тест: Для регистрации просмотра требуется аутентификация."""
        response = self.client.post(f"/api/videos/{self.video.pk}/view/")
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


@override_settings(
    AUTHENTICATION_BACKENDS=["django.contrib.auth.backends.ModelBackend"],
    FORCE_SCRIPT_NAME="",
)
class CourseAPITests(APITestCase):
    """
    Тесты для API курсов.
    
    Проверяет функциональность CRUD операций для курсов,
    включая управление видео в курсе, права доступа и валидацию.
    """

    def setUp(self):
        """Настройка тестового окружения."""
        from homepage.models import Course, CourseVideo, Video
        
        self.user = Employee.objects.create_user(
            username="regular_user",
            password="testpass123",
            email="user@example.com",
        )
        self.admin_user = Employee.objects.create_user(
            username="admin_user",
            password="adminpass123",
            email="admin@example.com",
            is_staff=True,
        )
        
        # Создаем видео для курсов
        self.video1 = Video.objects.create(
            name="Видео 1",
            description="Первое видео",
            author=self.admin_user,
            pub_date=timezone.now(),
            is_published=True,
        )
        self.video2 = Video.objects.create(
            name="Видео 2",
            description="Второе видео",
            author=self.admin_user,
            pub_date=timezone.now(),
            is_published=True,
        )
        
        # Создаем тестовый курс
        self.course = Course.objects.create(
            name="Тестовый курс",
            description="Описание тестового курса",
            author=self.admin_user,
            pub_date=timezone.now() - timedelta(hours=1),
            is_published=True,
        )
        
        # Добавляем видео в курс
        CourseVideo.objects.create(course=self.course, video=self.video1, order=1)
        CourseVideo.objects.create(course=self.course, video=self.video2, order=2)
        
        # Создаем неопубликованный курс
        self.unpublished_course = Course.objects.create(
            name="Неопубликованный курс",
            description="Этот курс не опубликован",
            author=self.admin_user,
            pub_date=timezone.now(),
            is_published=False,
        )

    def test_create_course_by_admin_success(self):
        """Тест: Администратор может создать курс."""
        self.client.force_authenticate(user=self.admin_user)
        
        data = {
            "name": "Новый курс",
            "description": "Описание нового курса",
            "pub_date": timezone.now().isoformat(),
            "is_published": True,
            "videos": [
                {"video_id": self.video1.pk, "order": 1},
                {"video_id": self.video2.pk, "order": 2},
            ]
        }
        
        response = self.client.post("/api/courses/", data, format="json")
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["name"], "Новый курс")
        # CourseWriteSerializer не возвращает author в ответе
        # Проверяем, что курс создан с правильным автором
        from homepage.models import Course
        created_course = Course.objects.get(name="Новый курс")
        self.assertEqual(created_course.author, self.admin_user)

    def test_create_course_by_regular_user_forbidden(self):
        """Тест: Обычный пользователь не может создавать курсы."""
        self.client.force_authenticate(user=self.user)
        
        data = {
            "name": "Запрещенный курс",
            "description": "Это должно быть запрещено",
            "pub_date": timezone.now().isoformat(),
            "is_published": True,
        }
        
        response = self.client.post("/api/courses/", data, format="json")
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_list_courses_shows_only_published(self):
        """Тест: Обычный пользователь видит только опубликованные курсы."""
        self.client.force_authenticate(user=self.user)
        
        response = self.client.get("/api/courses/")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        if "results" in response.data:
            courses = response.data["results"]
        else:
            courses = response.data
            
        course_names = [c["name"] for c in courses]
        self.assertIn("Тестовый курс", course_names)
        self.assertNotIn("Неопубликованный курс", course_names)

    def test_admin_sees_all_courses(self):
        """Тест: Администратор видит все курсы."""
        self.client.force_authenticate(user=self.admin_user)
        
        response = self.client.get("/api/courses/")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        if "results" in response.data:
            courses = response.data["results"]
        else:
            courses = response.data
            
        self.assertGreaterEqual(len(courses), 2)
        course_names = [c["name"] for c in courses]
        self.assertIn("Тестовый курс", course_names)
        self.assertIn("Неопубликованный курс", course_names)

    def test_retrieve_course_detail_with_videos(self):
        """Тест: При получении детальной информации о курсе возвращаются видео."""
        self.client.force_authenticate(user=self.user)
        
        response = self.client.get(f"/api/courses/{self.course.pk}/")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Тестовый курс")
        self.assertIn("course_videos", response.data)
        self.assertEqual(len(response.data["course_videos"]), 2)
        
        # Проверяем, что видео в правильном порядке
        self.assertEqual(response.data["course_videos"][0]["video"]["name"], "Видео 1")
        self.assertEqual(response.data["course_videos"][1]["video"]["name"], "Видео 2")

    def test_list_courses_shows_videos_count(self):
        """Тест: В списке курсов отображается количество видео."""
        self.client.force_authenticate(user=self.user)
        
        response = self.client.get("/api/courses/")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        if "results" in response.data:
            courses = response.data["results"]
        else:
            courses = response.data
            
        test_course = next(c for c in courses if c["name"] == "Тестовый курс")
        self.assertEqual(test_course["videos_count"], 2)

    def test_update_course_by_admin_success(self):
        """Тест: Администратор может обновить курс."""
        self.client.force_authenticate(user=self.admin_user)
        
        data = {
            "name": "Обновленный курс",
            "description": "Обновленное описание",
            "pub_date": self.course.pub_date.isoformat(),
            "is_published": True,
            "videos": [
                {"video_id": self.video2.pk, "order": 1},
            ]
        }
        
        response = self.client.put(f"/api/courses/{self.course.pk}/", data, format="json")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.course.refresh_from_db()
        self.assertEqual(self.course.name, "Обновленный курс")
        
        # Проверяем, что видео обновились
        self.assertEqual(self.course.coursevideo_set.count(), 1)

    def test_update_course_by_regular_user_forbidden(self):
        """Тест: Обычный пользователь не может обновлять курсы."""
        self.client.force_authenticate(user=self.user)
        
        data = {
            "name": "Попытка обновления",
            "description": "Это должно быть запрещено",
            "pub_date": self.course.pub_date.isoformat(),
            "is_published": True,
        }
        
        response = self.client.put(f"/api/courses/{self.course.pk}/", data, format="json")
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_course_by_admin_success(self):
        """Тест: Администратор может удалить курс."""
        from homepage.models import Course
        
        self.client.force_authenticate(user=self.admin_user)
        
        course_to_delete = Course.objects.create(
            name="Курс для удаления",
            description="Будет удален",
            author=self.admin_user,
            pub_date=timezone.now(),
            is_published=True,
        )
        
        course_id = course_to_delete.pk
        response = self.client.delete(f"/api/courses/{course_id}/")
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Course.objects.filter(pk=course_id).exists())

    def test_delete_course_by_regular_user_forbidden(self):
        """Тест: Обычный пользователь не может удалять курсы."""
        self.client.force_authenticate(user=self.user)
        
        response = self.client.delete(f"/api/courses/{self.course.pk}/")
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_course_without_videos(self):
        """Тест: Можно создать курс без видео."""
        self.client.force_authenticate(user=self.admin_user)
        
        data = {
            "name": "Курс без видео",
            "description": "Этот курс пока пустой",
            "pub_date": timezone.now().isoformat(),
            "is_published": True,
        }
        
        response = self.client.post("/api/courses/", data, format="json")
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["name"], "Курс без видео")


@override_settings(
    AUTHENTICATION_BACKENDS=["django.contrib.auth.backends.ModelBackend"],
    FORCE_SCRIPT_NAME="",
)
class CommentAPITests(APITestCase):
    """
    Тесты для API комментариев.
    
    Проверяет функциональность CRUD операций для комментариев,
    включая права доступа - все аутентифицированные пользователи могут комментировать.
    """

    def setUp(self):
        """Настройка тестового окружения."""
        from homepage.models import Comment, Video
        
        self.user = Employee.objects.create_user(
            username="regular_user",
            password="testpass123",
            email="user@example.com",
        )
        self.other_user = Employee.objects.create_user(
            username="other_user",
            password="otherpass123",
            email="other@example.com",
        )
        self.admin_user = Employee.objects.create_user(
            username="admin_user",
            password="adminpass123",
            email="admin@example.com",
            is_staff=True,
        )
        
        # Создаем видео
        self.video = Video.objects.create(
            name="Видео для комментариев",
            description="Тестовое видео",
            author=self.admin_user,
            pub_date=timezone.now(),
            is_published=True,
        )
        
        # Создаем комментарий от пользователя
        self.comment = Comment.objects.create(
            video=self.video,
            user=self.user,
            text="Тестовый комментарий",
        )

    def test_create_comment_by_regular_user_success(self):
        """Тест: Обычный пользователь может создать комментарий."""
        self.client.force_authenticate(user=self.user)
        
        data = {
            "video": self.video.pk,
            "text": "Новый комментарий от пользователя",
        }
        
        response = self.client.post("/api/comments/", data, format="json")
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["text"], "Новый комментарий от пользователя")
        self.assertEqual(response.data["user"], self.user.pk)

    def test_create_comment_by_another_user_success(self):
        """Тест: Другой пользователь также может создать комментарий."""
        self.client.force_authenticate(user=self.other_user)
        
        data = {
            "video": self.video.pk,
            "text": "Комментарий от другого пользователя",
        }
        
        response = self.client.post("/api/comments/", data, format="json")
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["user"], self.other_user.pk)

    def test_create_comment_by_admin_success(self):
        """Тест: Администратор может создать комментарий."""
        self.client.force_authenticate(user=self.admin_user)
        
        data = {
            "video": self.video.pk,
            "text": "Комментарий от администратора",
        }
        
        response = self.client.post("/api/comments/", data, format="json")
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["user"], self.admin_user.pk)

    def test_create_comment_without_authentication_forbidden(self):
        """Тест: Неаутентифицированный пользователь не может создать комментарий."""
        data = {
            "video": self.video.pk,
            "text": "Попытка комментария без авторизации",
        }
        
        response = self.client.post("/api/comments/", data, format="json")
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_comments(self):
        """Тест: Получение списка комментариев."""
        from homepage.models import Comment
        
        self.client.force_authenticate(user=self.user)
        
        # Создаем дополнительные комментарии
        Comment.objects.create(video=self.video, user=self.other_user, text="Второй комментарий")
        Comment.objects.create(video=self.video, user=self.admin_user, text="Третий комментарий")
        
        response = self.client.get("/api/comments/")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        if "results" in response.data:
            comments = response.data["results"]
        else:
            comments = response.data
            
        self.assertGreaterEqual(len(comments), 3)

    def test_filter_comments_by_video(self):
        """Тест: Фильтрация комментариев по видео."""
        from homepage.models import Comment, Video
        
        self.client.force_authenticate(user=self.user)
        
        # Создаем другое видео с комментарием
        other_video = Video.objects.create(
            name="Другое видео",
            description="Еще одно видео",
            author=self.admin_user,
            pub_date=timezone.now(),
            is_published=True,
        )
        Comment.objects.create(video=other_video, user=self.user, text="Комментарий к другому видео")
        
        response = self.client.get(f"/api/comments/?video={self.video.pk}")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        if "results" in response.data:
            comments = response.data["results"]
        else:
            comments = response.data
            
        # Все комментарии должны быть к нашему видео
        for comment in comments:
            self.assertEqual(comment["video"], self.video.pk)

    def test_retrieve_comment_detail(self):
        """Тест: Получение детальной информации о комментарии."""
        self.client.force_authenticate(user=self.user)
        
        response = self.client.get(f"/api/comments/{self.comment.pk}/")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["text"], "Тестовый комментарий")
        self.assertEqual(response.data["user"], self.user.pk)
        self.assertIn("user_name", response.data)

    def test_update_own_comment_success(self):
        """Тест: Пользователь может обновить свой комментарий."""
        self.client.force_authenticate(user=self.user)
        
        data = {
            "video": self.video.pk,
            "text": "Обновленный текст комментария",
        }
        
        response = self.client.put(f"/api/comments/{self.comment.pk}/", data, format="json")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.comment.refresh_from_db()
        self.assertEqual(self.comment.text, "Обновленный текст комментария")

    def test_update_others_comment_allowed(self):
        """Тест: Пользователь может обновить чужой комментарий (все аутентифицированные имеют доступ)."""
        self.client.force_authenticate(user=self.other_user)
        
        data = {
            "video": self.video.pk,
            "text": "Изменение чужого комментария",
        }
        
        response = self.client.put(f"/api/comments/{self.comment.pk}/", data, format="json")
        
        # Так как CommentViewSet использует только IsAuthenticated, любой пользователь может редактировать
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.comment.refresh_from_db()
        self.assertEqual(self.comment.text, "Изменение чужого комментария")

    def test_delete_own_comment_success(self):
        """Тест: Пользователь может удалить свой комментарий."""
        from homepage.models import Comment
        
        self.client.force_authenticate(user=self.user)
        
        comment_to_delete = Comment.objects.create(
            video=self.video,
            user=self.user,
            text="Комментарий для удаления",
        )
        
        comment_id = comment_to_delete.pk
        response = self.client.delete(f"/api/comments/{comment_id}/")
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Comment.objects.filter(pk=comment_id).exists())

    def test_delete_others_comment_allowed(self):
        """Тест: Пользователь может удалить чужой комментарий (все аутентифицированные имеют доступ)."""
        from homepage.models import Comment
        
        self.client.force_authenticate(user=self.other_user)
        
        comment_id = self.comment.pk
        response = self.client.delete(f"/api/comments/{comment_id}/")
        
        # Так как CommentViewSet использует только IsAuthenticated, любой пользователь может удалять
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Comment.objects.filter(pk=comment_id).exists())

    def test_comment_has_user_name_field(self):
        """Тест: Комментарий содержит поле user_name."""
        self.client.force_authenticate(user=self.user)
        
        response = self.client.get(f"/api/comments/{self.comment.pk}/")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("user_name", response.data)
        self.assertIsNotNone(response.data["user_name"])

    def test_create_comment_sets_pub_date_automatically(self):
        """Тест: При создании комментария автоматически устанавливается дата публикации."""
        from homepage.models import Comment
        
        self.client.force_authenticate(user=self.user)
        
        data = {
            "video": self.video.pk,
            "text": "Комментарий с автоматической датой",
        }
        
        response = self.client.post("/api/comments/", data, format="json")
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        comment = Comment.objects.get(pk=response.data["id"])
        self.assertIsNotNone(comment.pub_date)

    def test_comments_ordered_by_pub_date_desc(self):
        """Тест: Комментарии отсортированы по дате публикации (новые первыми)."""
        from homepage.models import Comment
        
        self.client.force_authenticate(user=self.user)
        
        # Создаем комментарии с разницей во времени
        old_comment = Comment.objects.create(
            video=self.video,
            user=self.user,
            text="Старый комментарий",
        )
        old_comment.pub_date = timezone.now() - timedelta(hours=2)
        old_comment.save()
        
        _ = Comment.objects.create(
            video=self.video,
            user=self.user,
            text="Новый комментарий",
        )
        
        response = self.client.get("/api/comments/")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        if "results" in response.data:
            comments = response.data["results"]
        else:
            comments = response.data
            
        # Первый комментарий должен быть самым новым
        if len(comments) > 0:
            self.assertEqual(comments[0]["text"], "Новый комментарий")



@override_settings(
    AUTHENTICATION_BACKENDS=["django.contrib.auth.backends.ModelBackend"],
    FORCE_SCRIPT_NAME="",
)
class SecretSantaAPITests(APITestCase):
    """Тесты для функционала Тайного Санты (анкет).

    Проверяет, что POST/PUT/PATCH/DELETE модифицируют анкету текущего пользователя,
    а GET возвращает анкету вместе с полями сезона (deadline, budget, is_active).
    """

    def setUp(self):
        from homepage.models import SecretSantaSeason

        self.user = Employee.objects.create_user(
            username="santa_user", password="password123", email="santa@example.com",
        )
        self.client.force_authenticate(user=self.user)

        # Создаём активный сезон
        self.season = SecretSantaSeason.objects.create(
            deadline=timezone.now() + timedelta(days=7), budget=1000.00, is_active=True,
        )

    def test_get_returns_participant_and_season(self):
        from homepage.models import SecretSantaParticipant

        # У пользователя ещё нет анкеты
        response = self.client.get("/api/seasonal/secret_santa/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Должны присутствовать поля сезона
        self.assertIn("deadline", response.data)
        self.assertIn("budget", response.data)
        self.assertIn("is_active", response.data)

        # Так как анкеты нет, gift_giver и gift_receiver = None
        self.assertIsNone(response.data.get("gift_giver"))
        self.assertIsNone(response.data.get("gift_receiver"))

        # Создадим анкету и повторим запрос
        SecretSantaParticipant.objects.create(gift_giver=self.user, wishes="Books", address="Street 1", zip_code=111111, phone="+70000000000")
        response = self.client.get("/api/seasonal/secret_santa/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # gift_giver should now be present and include id
        self.assertIsNotNone(response.data.get("gift_giver"))
        self.assertEqual(response.data["gift_giver"]["id"], self.user.pk)

    def test_post_creates_participant(self):
        data = {"wishes": "Chocolates", "address": "Addr 1", "zip_code": 123456, "phone": "+70001112233"}
        response = self.client.post("/api/seasonal/secret_santa/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        from homepage.models import SecretSantaParticipant

        self.assertTrue(SecretSantaParticipant.objects.filter(gift_giver=self.user).exists())
        obj = SecretSantaParticipant.objects.get(gift_giver=self.user)
        self.assertEqual(obj.wishes, "Chocolates")

    def test_post_when_exists_returns_400(self):
        from homepage.models import SecretSantaParticipant

        SecretSantaParticipant.objects.create(gift_giver=self.user)
        response = self.client.post("/api/seasonal/secret_santa/", {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Анкета уже существует", str(response.data))

    def test_patch_updates_participant(self):
        from homepage.models import SecretSantaParticipant

        participant = SecretSantaParticipant.objects.create(gift_giver=self.user, wishes="Old", phone="+7000")
        data = {"wishes": "New wishes", "phone": "+79991112233"}
        response = self.client.patch("/api/seasonal/secret_santa/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        participant.refresh_from_db()
        self.assertEqual(participant.wishes, "New wishes")
        self.assertEqual(participant.phone, "+79991112233")

    def test_delete_removes_participant(self):
        from homepage.models import SecretSantaParticipant

        SecretSantaParticipant.objects.create(gift_giver=self.user)
        response = self.client.delete("/api/seasonal/secret_santa/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(SecretSantaParticipant.objects.filter(gift_giver=self.user).exists())

    def test_cannot_assign_self_as_gift_receiver(self):
        # Попытка указать себя в поле gift_receiver должна приводить к ошибке валидации
        data = {"wishes": "X", "gift_receiver": self.user.pk}
        response = self.client.post("/api/seasonal/secret_santa/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("gift_receiver cannot be the same as gift_giver", str(response.data))

    def test_get_includes_gift_receiver_and_their_participant(self):
        from homepage.models import SecretSantaParticipant

        # create receiver and their participant
        receiver = Employee.objects.create_user(username="receiver", password="pw")
        SecretSantaParticipant.objects.create(gift_giver=receiver, wishes="Receiver wish", phone="+100")

        # create giver's participant that points to receiver
        SecretSantaParticipant.objects.create(gift_giver=self.user, gift_receiver=receiver, wishes="Giver wish", phone="+200")

        response = self.client.get("/api/seasonal/secret_santa/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertIn("gift_giver", response.data)
        self.assertIn("gift_receiver", response.data)

        gift_giver = response.data["gift_giver"]
        self.assertEqual(gift_giver["id"], self.user.pk)
        self.assertEqual(gift_giver["wishes"], "Giver wish")

        gift_receiver = response.data["gift_receiver"]
        self.assertEqual(gift_receiver["id"], receiver.pk)
        # receiver participant fields are flattened into gift_receiver
        self.assertEqual(gift_receiver["wishes"], "Receiver wish")
        self.assertEqual(gift_receiver["phone"], "+100")


@override_settings(
    AUTHENTICATION_BACKENDS=["django.contrib.auth.backends.ModelBackend"],
    FORCE_SCRIPT_NAME="",
)
class SwaggerSchemaGenerationTests(APITestCase):
    """Ensure viewsets short-circuit during drf_yasg schema generation."""

    def setUp(self):
        self.factory = APIRequestFactory()

    def test_idea_get_queryset_short_circuits_for_swagger(self):
        from api.views import IdeaViewSet

        view = IdeaViewSet()
        request = self.factory.get("/")
        request.user = AnonymousUser()
        view.request = request
        view.swagger_fake_view = True

        qs = view.get_queryset()
        # should be an empty queryset and not raise
        self.assertEqual(qs.count(), 0)

    def test_favorite_segment_get_queryset_short_circuits_for_swagger(self):
        from api.views import FavoriteSegmentViewSet

        view = FavoriteSegmentViewSet()
        request = self.factory.get("/")
        request.user = AnonymousUser()
        view.request = request
        view.swagger_fake_view = True

        qs = view.get_queryset()
        self.assertEqual(qs.count(), 0)
