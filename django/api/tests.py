from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from employees.models import Employee, Rating, StructuralSubdivision, Organization


class RatingAPITests(APITestCase):

    def setUp(self):
        """
        Настраиваем тестовое окружение: создаем двух пользователей
        и аутентифицируем одного из них.
        """
        self.user = Employee.objects.create_user(
            username='main_user',
            password='testpassword123',
            email='main@example.com'
        )
        self.other_employee = Employee.objects.create_user(
            username='other_employee',
            password='testpassword123',
            email='other@example.com'
        )

        self.client.login(username='main_user', password='testpassword123')

    def test_create_rating_successfully(self):
        """Тест: Успешное создание новой оценки для другого сотрудника (POST)."""
        url = reverse('colleagues-rate', kwargs={'pk': self.other_employee.pk})
        rating_data = {"rate": 5, "text": "Отличная работа!"}

        response = self.client.post(url, rating_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Rating.objects.filter(user=self.user, employee=self.other_employee).exists())
        self.assertEqual(response.data['message'], "Вы успешно оценили сотрудника.")

    def test_create_duplicate_rating_fails(self):
        """Тест: Попытка создать вторую оценку тому же сотруднику должна провалиться (POST)."""
        Rating.objects.create(user=self.user, employee=self.other_employee, rate=4)

        url = reverse('colleagues-rate', kwargs={'pk': self.other_employee.pk})
        rating_data = {"rate": 5, "text": "Пытаюсь оценить снова."}

        response = self.client.post(url, rating_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Нельзя оценивать одного сотрудника дважды", str(response.data))

    def test_update_existing_rating_successfully(self):
        """
        Тест (Успешный случай): Пользователь успешно обновляет свою существующую оценку (PUT).
        """
        rating_instance = Rating.objects.create(
            user=self.user,
            employee=self.other_employee,
            rate=3,
            text="Первоначальная оценка"
        )
        url = reverse('colleagues-rate', kwargs={'pk': self.other_employee.pk})
        update_data = {"rate": 5, "text": "Оценка обновлена!"}

        response = self.client.put(url, update_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        rating_instance.refresh_from_db()
        self.assertEqual(rating_instance.rate, 5)
        self.assertEqual(rating_instance.text, "Оценка обновлена!")
        self.assertEqual(response.data['message'], "Вы успешно обновили оценку.")

    def test_update_non_existent_rating_fails_with_404(self):
        """
        Тест (Случай ошибки): Попытка обновить несуществующую оценку должна вернуть 404 (PUT).
        """
        url = reverse('colleagues-rate', kwargs={'pk': self.other_employee.pk})
        update_data = {"rate": 4}

        self.assertFalse(Rating.objects.filter(user=self.user, employee=self.other_employee).exists())

        response = self.client.put(url, update_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn("Вы еще не ставили оценку этому сотруднику", str(response.data))

    def test_cannot_rate_self_post_fails(self):
        """
        Тест: Нельзя оценить самого себя через POST.
        """
        url = reverse('colleagues-rate', kwargs={'pk': self.user.pk})
        rating_data = {"rate": 5}
        response = self.client.post(url, rating_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Вы не можете оценить самого себя", str(response.data))

    def test_cannot_rate_self_put_fails(self):
        """
        Тест: Нельзя оценить самого себя через PUT.
        Эта проверка происходит до поиска оценки, поэтому она все еще актуальна.
        """
        url = reverse('colleagues-rate', kwargs={'pk': self.user.pk})
        rating_data = {"rate": 5}
        response = self.client.put(url, rating_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Вы не можете оценить самого себя", str(response.data))


class StructuralSubdivisionAPITests(APITestCase):

    def setUp(self):
        """
        Подготавливаем данные, которые будут использоваться в нескольких тестах.
        """
        self.user = Employee.objects.create_user(username='testuser', password='password123')
        self.client.force_authenticate(user=self.user)

        self.organization = Organization.objects.create(name="Главная Организация")
        self.chief_employee = Employee.objects.create_user(username='chief', password='password123')
        self.supervisor_employee = Employee.objects.create_user(username='supervisor', password='password123')
        self.parent_subdivision = StructuralSubdivision.objects.create(
            name="Головной Департамент",
            organization=self.organization
        )

    def test_create_subdivision(self):
        """
        Проверяем успешное создание нового структурного подразделения (POST).
        """
        url = reverse('subdivision-list')
        data = {
            "name": "Новый Отдел Разработки",
            "organization": self.organization.pk,
            "chief": self.chief_employee.pk,
            "supervisor": self.supervisor_employee.pk,
            "parent_structural_subdivision": self.parent_subdivision.pk
        }

        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(StructuralSubdivision.objects.filter(name="Новый Отдел Разработки").exists())
        self.assertEqual(response.data['name'], "Новый Отдел Разработки")
        self.assertEqual(response.data['chief'], self.chief_employee.pk)

    def setUp_for_update(self):
        """Вспомогательный метод, создающий объект для обновления в тестах"""
        return StructuralSubdivision.objects.create(
            name="Отдел для изменения",
            organization=self.organization,
            chief=self.chief_employee
        )

    def test_update_name(self):
        """Проверяем изменение атрибута 'name'."""
        # Arrange
        subdivision = self.setUp_for_update()
        url = reverse('subdivision-detail', kwargs={'pk': subdivision.pk})
        new_name = "Измененное Название Отдела"
        data = {"name": new_name}

        response = self.client.patch(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        subdivision.refresh_from_db()
        self.assertEqual(subdivision.name, new_name)

    def test_update_chief(self):
        """Проверяем изменение атрибута 'chief'."""

        subdivision = self.setUp_for_update()
        new_chief = Employee.objects.create_user(username='newchief')
        url = reverse('subdivision-detail', kwargs={'pk': subdivision.pk})
        data = {"chief": new_chief.pk}

        response = self.client.patch(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        subdivision.refresh_from_db()
        self.assertEqual(subdivision.chief, new_chief)

    def test_update_supervisor(self):
        """Проверяем изменение атрибута 'supervisor'."""

        subdivision = self.setUp_for_update()
        url = reverse('subdivision-detail', kwargs={'pk': subdivision.pk})
        data = {"supervisor": self.supervisor_employee.pk}

        response = self.client.patch(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        subdivision.refresh_from_db()
        self.assertEqual(subdivision.supervisor, self.supervisor_employee)

    def test_update_parent_subdivision(self):
        """Проверяем изменение атрибута 'parent_structural_subdivision'."""

        subdivision = self.setUp_for_update()
        url = reverse('subdivision-detail', kwargs={'pk': subdivision.pk})
        data = {"parent_structural_subdivision": self.parent_subdivision.pk}

        response = self.client.patch(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        subdivision.refresh_from_db()
        self.assertEqual(subdivision.parent_structural_subdivision, self.parent_subdivision)

    def test_set_chief_to_null(self):
        """Проверяем возможность обнулить 'chief' (так как поле nullable)."""

        subdivision = self.setUp_for_update()
        url = reverse('subdivision-detail', kwargs={'pk': subdivision.pk})
        data = {"chief": None}

        response = self.client.patch(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        subdivision.refresh_from_db()
        self.assertIsNone(subdivision.chief)

    def test_delete_subdivision(self):
        """
        Проверяем успешное удаление структурного подразделения (DELETE).
        """

        subdivision_to_delete = StructuralSubdivision.objects.create(
            name="Отдел на удаление",
            organization=self.organization
        )
        url = reverse('subdivision-detail', kwargs={'pk': subdivision_to_delete.pk})

        self.assertTrue(StructuralSubdivision.objects.filter(pk=subdivision_to_delete.pk).exists())

        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(StructuralSubdivision.objects.filter(pk=subdivision_to_delete.pk).exists())
