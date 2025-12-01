import os

import psycopg2
import requests
from django.contrib.auth.backends import ModelBackend

from employees.models import Employee

url = os.getenv("CHALLENGE_URL", "0")
db_name = os.getenv("DB_NAME_LIFERAY", "0")
db_user = os.getenv("DB_USER_LIFERAY", "0")
db_password = os.getenv("DB_PASSWORD_LIFERAY", "0")
db_host = os.getenv("DB_HOST_LIFERAY", "127.0.0.1")
db_port = os.getenv("DB_PORT_LIFERAY", "5432")

connection = psycopg2.connect(
    database=db_name,
    user=db_user,
    password=db_password,
    host=db_host,
    port=db_port,
)
cursor = connection.cursor()


class LiferayDatabaseBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None):
        cookies = request.COOKIES
        data = {"p_auth": password}

        try:
            user = Employee.objects.get(email=username)

            if not user.check_password(password):
                response = requests.post(url, cookies=cookies, data=data, verify=False)
                if response.status_code != 200:
                    return None
                
                # Verify emailAddress matches username
                try:
                    user_data = response.json()
                    if user_data.get("emailAddress") != username:
                        return None
                except (ValueError, KeyError):
                    return None

                # Verify emailAddress matches username
                try:
                    user_data = response.json()
                    if user_data.get("emailAddress") != username:
                        return None
                except (ValueError, KeyError):
                    return None

        except Employee.DoesNotExist:
            cursor.execute(
                """
                SELECT
                    u.firstname, u.middlename, u.lastname,
                    u.jobtitle, u.companyid, c.birthday
                FROM user_ u
                INNER JOIN contact_ c
                USING (emailaddress)
                WHERE emailaddress = %s;
                """,
                (username,),
            )
            name, patronym, surname, job_title, companyid, birth_date = (
                cursor.fetchone()
            )
            user = Employee(
                email=username,
                username=username,
                name=name,
                surname=surname,
                patronym=patronym,
                birth_date=None,
                job_title=job_title,
            )
            user.set_password(password)
            user.save()
        return user
