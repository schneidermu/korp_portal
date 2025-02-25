import logging

from employees.models import Employee
from korp_portal.backends import cursor


def run():
    cursor.execute(
        "SELECT emailaddress, firstname, middlename, lastname, jobtitle, companyid FROM user_"
    )

    list_of_users = cursor.fetchall()
    for email, name, patronym, surname, job_title, companyid in list_of_users:
        cursor.execute(
            "SELECT birthday FROM contact_ WHERE emailaddress = %s;", (email,)
        )
        birth_date = cursor.fetchone()[0]

        try:
            user = Employee.objects.get(email=email)
        except Employee.DoesNotExist:
            user = Employee(
                email=email,
                username=email,
                name=name,
                surname=surname,
                patronym=patronym,
                birth_date=birth_date,
                job_title=job_title,
            )
            user.save()
