import csv
import logging
import os

from django.conf import settings
from django.contrib.auth.models import User
from email_validator import EmailNotValidError, validate_email
from employees.models import Employee

logger = logging.getLogger(__name__)

# TODO: Создание организаций и отделов из иерархии


def run():
    """
    Import employees from CSV file and create corresponding User and Employee objects.
    The CSV file should be in the project's root directory.
    CSV structure: organization;structural_subdivision;fio;job_title;telephone_number;inner_telephone_number;office;email
    """
    csv_file_path = os.path.join(settings.BASE_DIR, "scripts", "Список сотрудников.csv")

    if not os.path.exists(csv_file_path):
        logger.error(f"CSV file not found at: {csv_file_path}")
        return

    logger.info(f"Importing employees from {csv_file_path}")

    # Track statistics
    created_count = 0
    updated_count = 0
    error_count = 0

    try:
        # Open with utf-8-sig encoding to handle potential BOM in CSV files
        with open(csv_file_path, "r", encoding="utf-8-sig") as csv_file:
            reader = csv.DictReader(csv_file, delimiter=";")

            for row in reader:
                try:
                    # Extract data from CSV row
                    organization = row.get("organization", "").strip()
                    structural_subdivision = row.get(
                        "structural_subdivision", ""
                    ).strip()
                    fio = row.get("fio", "").strip()
                    job_title = row.get("job_title", "").strip()
                    telephone_number = row.get("telephone_number", "").strip()
                    inner_telephone_number = row.get(
                        "inner_telephone_number", ""
                    ).strip()
                    office = row.get("office", "").strip()
                    email = row.get("email", "").strip()

                    try:
                        emailinfo = validate_email(email, check_deliverability=False)
                        email = emailinfo.normalized
                        if not email.endswith("@voda.gov.ru"):
                            email = None
                    except EmailNotValidError:
                        email = None

                    # Parse FIO (surname name patronymic)
                    fio_parts = fio.split()
                    if len(fio_parts) >= 2:
                        last_name = fio_parts[0]
                        first_name = fio_parts[1]
                        # Join the rest as patronymic if available
                        patronymic = (
                            " ".join(fio_parts[2:]) if len(fio_parts) > 2 else ""
                        )
                    else:
                        logger.warning(f"Invalid FIO format: {fio}")
                        last_name = fio
                        first_name = ""
                        patronymic = ""

                    if not (fio and email):
                        logger.warning(
                            f"Skipping row with missing required data: {row}"
                        )
                        error_count += 1
                        continue

                    # Create or update Employee
                    employee, emp_created = Employee.objects.update_or_create(
                        name=first_name,
                        surname=last_name,
                        patronym=patronymic,
                        email=email,
                        defaults={
                            "username": email,
                            #                            'organization': organization,
                            #                            'structural_subdivision': structural_subdivision,
                            "job_title": job_title,
                            "telephone_number": telephone_number,
                            "inner_telephone_number": inner_telephone_number,
                            "office": office,
                        },
                    )

                    if emp_created:
                        created_count += 1
                    else:
                        updated_count += 1

                    logger.debug(f"Processed employee: {fio} ({email})")

                except Exception as e:
                    logger.error(f"Error processing row {row}: {str(e)}")
                    error_count += 1

        logger.info(
            f"Import completed. Created: {created_count}, Updated: {updated_count}, Errors: {error_count}"
        )

    except Exception as e:
        logger.error(f"Failed to import employees: {str(e)}")


if __name__ == "__main__":
    run()
