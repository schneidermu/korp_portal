import logging
import os

import ldap
import psycopg2
import requests
from django.conf import settings
from django.contrib.auth.backends import ModelBackend
from django_auth_ldap.backend import LDAPBackend, _LDAPUser, _report_error, logger
from employees.models import Employee

url = os.getenv("CHALLENGE_URL", "0")
liferay_db_name = os.getenv("POSTGRES_DB_LIFERAY", "0")
liferay_db_user = os.getenv("POSTGRES_USER_LIFERAY", "0")
liferay_db_password = os.getenv("POSTGRES_PASSWORD_LIFERAY", "0")
db_host = os.getenv("DB_HOST", "127.0.0.1")
db_port = os.getenv("DB_PORT", "5432")

connection = psycopg2.connect(
    database=liferay_db_name,
    user=liferay_db_user,
    password=liferay_db_password,
    host=db_host,
    port=db_port,
)
cursor = connection.cursor()


class _CustomLDAPUser(_LDAPUser):
    def authenticate(self, password, cookies):
        """
        Authenticates against the LDAP directory and returns the corresponding
        User object if successful. Returns None on failure.
        """
        user = None

        try:
            data = {"p_auth": password}
            response = requests.post(url, cookies=cookies, data=data)

            if response.status_code != 200:
                raise self.AuthenticationFailed

            self._check_requirements()
            self._get_or_create_user()

            user = self._user
        except self.AuthenticationFailed as e:
            logger.debug("Authentication failed for %s: %s", self._username, e)
        except ldap.LDAPError as e:
            _report_error(
                type(self.backend), "authenticate", self._user, self._request, e
            )
        except Exception as e:
            logger.warning("%s while authenticating %s", e, self._username)
            raise

        return user


class CustomLDAPBackend(LDAPBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        cookies = request.COOKIES

        username = kwargs.get(self.get_user_model().USERNAME_FIELD, username)
        if username is None:
            return None

        if password or self.settings.PERMIT_EMPTY_PASSWORD:
            ldap_user = _CustomLDAPUser(
                self, username=username.strip(), request=request
            )
            user = self.authenticate_ldap_user(ldap_user, password, cookies)
        else:
            logger.debug("Rejecting empty password for %s", username)
            user = None

        return user

    def authenticate_ldap_user(self, ldap_user, password, cookies):
        """
        Returns an authenticated Django user or None.
        """
        return ldap_user.authenticate(password, cookies)


class LiferayDatabaseBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None):
        cookies = request.COOKIES
        data = {"p_auth": password}
        response = requests.post(url, cookies=cookies, data=data)
        if response.status_code != 200:
            return None

        try:
            user = Employee.objects.get(email=username)
        except Employee.DoesNotExist:
            cursor.execute(
                "SELECT firstname, middlename, lastname, jobtitle, companyid FROM user_ WHERE emailaddress = %s;",
                (username,),
            )
            name, patronym, surname, job_title, companyid = cursor.fetchone()
            cursor.execute(
                "SELECT birthday FROM contact_ WHERE emailaddress = %s;", (username,)
            )
            birth_date = cursor.fetchone()
            user = Employee(
                email=username,
                username=username,
                name=name,
                surname=surname,
                patronym=patronym,
                birth_date=birth_date,
                job_title=job_title,
            )
            user.save()
        return user
