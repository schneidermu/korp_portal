from rest_framework.test import APITestCase
from rest_framework import status
from django.test import override_settings
from django.utils import timezone
from datetime import timedelta
from employees.models import (
    Employee,
    Rating,
    StructuralSubdivision,
    Organization,
    Competence,
    Idea,
)
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
            username="main_user", password="testpassword123", email="main@example.com"
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
            user=self.user, employee=self.other_employee
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
            user=self.user, employee=self.other_employee
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
            user=self.user, employee=self.other_employee
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
            Rating.objects.filter(user=self.user, employee=self.other_employee).exists()
        )
        self.assertEqual(response.data["message"], "Вы успешно удалили свою оценку.")

    def test_delete_non_existent_rating_fails(self):
        """
        Тест: Попытка удалить несуществующую оценку должна провалиться (DELETE).
        """
        url = f"/api/colleagues/{self.other_employee.pk}/rate/"

        # Убеждаемся, что оценки не существует
        self.assertFalse(
            Rating.objects.filter(user=self.user, employee=self.other_employee).exists()
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
                user=self.user, employee=self.other_employee, rate=3
            ).exists()
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
            username="testuser", password="password123"
        )
        # Создаем администратора для операций создания/редактирования
        self.admin_user = Employee.objects.create_user(
            username="admin", password="password123", is_staff=True
        )
        self.client.force_authenticate(
            user=self.admin_user
        )  # Используем администратора по умолчанию

        self.organization = Organization.objects.create(name="Главная Организация")
        self.chief_employee = Employee.objects.create_user(
            username="chief", password="password123"
        )
        self.supervisor_employee = Employee.objects.create_user(
            username="supervisor", password="password123"
        )
        self.parent_subdivision = StructuralSubdivision.objects.create(
            name="Головной Департамент", organization=self.organization
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
            StructuralSubdivision.objects.filter(name="Новый Отдел Разработки").exists()
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
            subdivision.parent_structural_subdivision, self.parent_subdivision
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
            name="Отдел на удаление", organization=self.organization
        )
        url = f"/api/subdivisions/{subdivision_to_delete.pk}/"

        self.assertTrue(
            StructuralSubdivision.objects.filter(pk=subdivision_to_delete.pk).exists()
        )

        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(
            StructuralSubdivision.objects.filter(pk=subdivision_to_delete.pk).exists()
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
            username="testuser", password="password123"
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
            username="testuser", password="password123"
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
            username="testuser", password="password123"
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
            username="testuser", password="password123"
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
            username="testuser", password="password123"
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
            username="testuser", password="password123"
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
            username="testuser", password="password123"
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
            username="testuser", password="password123"
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
            username="testuser", password="password123"
        )
        self.other_user = Employee.objects.create_user(
            username="otheruser", password="password123"
        )
        self.client.force_authenticate(user=self.user)

        # Создаем идею от текущего пользователя, чтобы он мог её видеть
        self.idea = Idea.objects.create(
            text="This is a test idea",
            author=self.user,  # Изменили с other_user на self.user
        )

        # Создаем идею от другого пользователя для тестов доступа
        self.other_idea = Idea.objects.create(
            text="Other user's idea", author=self.other_user
        )

    def test_list_ideas(self):
        """Тест: Получение списка идей."""
        url = "/api/ideas/"
        response = self.client.get(url)

        self.assertEqual(
            response.status_code, status.HTTP_200_OK, "Не удалось получить список идей"
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
            response.status_code, status.HTTP_201_CREATED, "Не удалось создать идею"
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
            response.status_code, status.HTTP_200_OK, "Не удалось обновить свою идею"
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
            username="admin", password="password123", is_staff=True
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
            username="admin", password="password123", is_staff=True
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
            username="admin", password="password123", is_staff=True
        )

        # Создаем идею с одобренным статусом
        approved_idea = Idea.objects.create(
            text="Approved idea", author=self.user, status="Одобрено"
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
        my_idea = Idea.objects.create(text="My private idea", author=self.user)

        url = "/api/ideas/"
        response = self.client.get(url)

        self.assertEqual(
            response.status_code, status.HTTP_200_OK, "Не удалось получить список идей"
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
            username="admin", password="password123", is_staff=True
        )
        self.client.force_authenticate(user=admin_user)

        url = "/api/ideas/"
        response = self.client.get(url)

        self.assertEqual(
            response.status_code, status.HTTP_200_OK, "Не удалось получить список идей"
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
