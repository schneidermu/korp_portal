from employees.models import Employee, Organization, StructuralSubdivision
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APIRequestFactory, force_authenticate

from django.test import TestCase
from django.urls import reverse

from .views import ColleagueProfileViewset


class TestApi(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        org, _ = Organization.objects.get_or_create(pk=1)
        division, _ = StructuralSubdivision.objects.get_or_create(
            pk=1, organization=org
        )
        self.user = Employee.objects.create_user(
            username="testuser", password="testpassword", structural_division=division
        )
        Token.objects.create(user=self.user)

    def test_polls_api(self):
        url = reverse("poll-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_news_api(self):
        url = reverse("news-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_colleagues_api_unauthorized(self):
        url = reverse("colleagues-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_colleagues_api_authorized(self):
        url = reverse("colleagues-list")
        request = self.factory.get(url)
        force_authenticate(request, user=self.user)
        response = ColleagueProfileViewset.as_view({"get": "list"})(request)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_org_structure_api(self):
        url = reverse("org-structure-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_organization_api(self):
        url = reverse("organization-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
