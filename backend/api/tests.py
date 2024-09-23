from django.test import TestCase
from rest_framework.test import APIRequestFactory
from rest_framework.authtoken.models import Token
from employees.models import Employee


class TestApi(TestCase):

    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = Employee.objects.create_user(
            username='testuser', password='testpassword')
        Token.objects.create(user=self.user)

    def test_polls_api(self):
        request = self.factory.get('polls')
        response = self.client.get(request)
        self.assertEqual(response.status_code, 200)

    def test_news_api(self):
        request = self.factory.get('news')
        response = self.client.get(request)
        self.assertEqual(response.status_code, 200)

    def test_colleagues_api(self):
        request = self.factory.get('colleagues')
        response = self.client.get(request)
        self.assertEqual(response.status_code, 200)

    def test_org_structure_api(self):
        request = self.factory.get('org-structure')
        response = self.client.get(request)
        self.assertEqual(response.status_code, 200)

    def test_organization_api(self):
        request = self.factory.get('organization')
        response = self.client.get(request)
        self.assertEqual(response.status_code, 200)
