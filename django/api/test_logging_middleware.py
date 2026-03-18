from types import SimpleNamespace
from unittest.mock import patch

from django.contrib.auth.models import AnonymousUser
from django.http import HttpResponse
from django.test import RequestFactory, SimpleTestCase, override_settings

from api.middleware.logging_middleware import ApiLoggingMiddleware


class ApiLoggingMiddlewareTests(SimpleTestCase):
    def setUp(self):
        self.factory = RequestFactory()

    def _middleware(self):
        return ApiLoggingMiddleware(lambda request: HttpResponse(status=200))

    @override_settings(LOGS_IGNORE_USERS={"service_user"})
    @patch("api.middleware.logging_middleware.api_logger.info")
    def test_logs_authenticated_non_ignored_user(self, logger_info_mock):
        request = self.factory.get("/api/profile/")
        request.user = SimpleNamespace(is_authenticated=True, username="regular_user")

        response = self._middleware()(request)

        self.assertEqual(response.status_code, 200)
        logger_info_mock.assert_called_once_with(
            "User: regular_user, Action: GET /api/profile/",
        )

    @override_settings(LOGS_IGNORE_USERS={"service_user"})
    @patch("api.middleware.logging_middleware.api_logger.info")
    def test_does_not_log_authenticated_ignored_user(self, logger_info_mock):
        request = self.factory.get("/api/profile/")
        request.user = SimpleNamespace(is_authenticated=True, username="service_user")

        response = self._middleware()(request)

        self.assertEqual(response.status_code, 200)
        logger_info_mock.assert_not_called()

    @override_settings(LOGS_IGNORE_USERS={"Anonymous"})
    @patch("api.middleware.logging_middleware.api_logger.info")
    def test_anonymous_request_is_logged_even_if_anonymous_in_ignore_list(
        self,
        logger_info_mock,
    ):
        request = self.factory.get("/api/public/")
        request.user = AnonymousUser()

        response = self._middleware()(request)

        self.assertEqual(response.status_code, 200)
        logger_info_mock.assert_called_once_with(
            "User: Anonymous, Action: GET /api/public/",
        )
