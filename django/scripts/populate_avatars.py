import base64
import logging
import uuid

import requests
from django.core.files.base import ContentFile
from employees.models import Employee, UploadedFile
from korp_portal.backends import cursor

logger = logging.getLogger(__name__)


def base64_to_uploaded_file(base64_string, filename=None):
    format, imgstr = (
        base64_string.split(";base64,")
        if ";base64," in base64_string
        else ("", base64_string)
    )
    ext = format.split("/")[-1] if "/" in format else "bin"

    if not filename:
        filename = f"{uuid.uuid4()}.{ext}"

    decoded_file = base64.b64decode(imgstr)

    content_file = ContentFile(decoded_file, name=filename)
    result = UploadedFile.objects.create(file=content_file)

    return result.file


def run(*args):
    url, p_auth, JSESSIONID = args

    cookies = {"JSESSIONID": JSESSIONID}

    cursor.execute("SELECT emailaddress, userid FROM user_")

    list_of_users = cursor.fetchall()

    for email, userid in list_of_users:
        try:
            user = Employee.objects.get(email=email)
        except Employee.DoesNotExist:
            logger.info(f"User with email {email} not found.")
            continue

        data = {
            "p_auth": p_auth,
            "userId": userid,
        }

        response = requests.get(url, cookies=cookies, data=data)

        base64_string = response.json().get["id"]

        if base64_string is None:
            logger.info(f"User with email {email} does not have an avatar.")
            continue

        file = base64_to_uploaded_file(base64_string)

        user.avatar = f"/media/{file}"
        user.save()

        logger.info(f"User with email {email} has been updated with avatar: {file}.")
