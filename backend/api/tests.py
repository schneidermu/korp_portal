from django.test import TestCase
from rest_framework.test import APIRequestFactory
from rest_framework.authtoken.models import Token
from rest_framework import status
from employees.models import Employee, StructuralSubdivision
from django.urls import reverse


class TestApi(TestCase):

    def setUp(self):
        self.factory = APIRequestFactory()
        division = StructuralSubdivision.objects.get(pk=1)
        self.user = Employee.objects.create_user(
            username='testuser', password='testpassword', structural_division=division)
        Token.objects.create(user=self.user)

    def test_polls_api(self):
        url = reverse('poll-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_news_api(self):
        url = reverse('news-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_colleagues_api(self):
        url = reverse('colleagues-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_org_structure_api(self):
        url = reverse('org-structure-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_organization_api(self):
        url = reverse('organization-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
