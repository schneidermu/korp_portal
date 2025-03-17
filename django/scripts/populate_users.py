import logging

from employees.models import Employee
from korp_portal.backends import cursor


def run():
    cursor.execute(
        """
        SELECT
            emailaddress,
            u.firstname, u.middlename, u.lastname,
            u.jobtitle, u.companyid, c.birthday
        FROM user_ u
        INNER JOIN contact_ c
        USING (emailaddress);
        """
    )

    list_of_users = cursor.fetchall()
    for (
        email,
        name,
        patronym,
        surname,
        job_title,
        companyid,
        birth_date,
    ) in list_of_users:
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
