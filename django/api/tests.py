from datetime import timedelta

from django.test import override_settings
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

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
        self.organization = Organization.objects.create(name="Test Organization")
        
        self.structural_division = StructuralSubdivision.objects.create(
            name="Test Division",
            organization=self.organization,
        )
        
        self.user = Employee.objects.create_user(
            username="testuser", password="password123",
        )

        self.user.structural_division = self.structural_division
        self.user.save()
        
        self.client.force_authenticate(user=self.user)

        self.published_news = News.objects.create(
            title="Published News",
            text="This is published news content",
            is_published=True,
            pub_date=timezone.now() - timedelta(hours=1),
        )
        self.published_news.organization.set([self.organization])

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
        """Тест: Пользователь видит только новости своей организации или без организации."""
        # Create news with no organization (should be visible to all users)
        News.objects.create(
            title="News Without Organization",
            text="This news has no organization",
            is_published=True,
            pub_date=timezone.now() - timedelta(hours=1),
        )
        # Don't set any organization
        
        # Create news with different organization (should NOT be visible)
        other_org = Organization.objects.create(name="Other Organization")
        news_other_org = News.objects.create(
            title="News Other Organization",
            text="This news is for another organization",
            is_published=True,
            pub_date=timezone.now() - timedelta(hours=1),
        )
        news_other_org.organization.set([other_org])
        
        url = "/api/news/"
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check if paginated or direct list
        if "results" in response.data:
            news_list = response.data["results"]
        else:
            news_list = response.data
            
        # User should see: published_news (their org) + news_no_org (no org)
        # Should NOT see: unpublished_news (not published) + news_other_org (different org)
        self.assertEqual(
            len(news_list), 
            2, 
            f"Ожидалось 2 новости (своя организация + без организации), получено: {len(news_list)}",
        )
        
        titles = [news["title"] for news in news_list]
        self.assertIn("Published News", titles)
        self.assertIn("News Without Organization", titles)
        self.assertNotIn("News Other Organization", titles)


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


