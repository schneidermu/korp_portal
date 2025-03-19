import base64
import logging
import warnings

import requests
from django.core.files.base import ContentFile
from employees.models import Employee, UploadedFile
from korp_portal.backends import cursor

logger = logging.getLogger(__name__)

EXT = "png"


def liferay_fetch_avatar(url: str, user_id: int, p_auth: str, jsessionid: str):
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        res = requests.post(
            url,
            cookies={"JSESSIONID": jsessionid},
            data={"p_auth": p_auth, "userId": user_id},
            verify=False,
        )
    data = res.json()
    status = data["status"]
    if status != 1:
        return None
    return data["result"]["id"]


def upload_base64_avatar(email: str, avatar_base64: str):
    email_address = email.split("@")[0]
    filename = f"imported-avatars/{email_address}.{EXT}"

    avatar_binary = base64.b64decode(avatar_base64)

    content_file = ContentFile(avatar_binary, name=filename)
    result = UploadedFile.objects.create(file=content_file)

    return result.file


def run(*args):
    url, p_auth, jsessionid = args

    update_cnt = 0

    cursor.execute("SELECT emailaddress, userid FROM user_ ORDER BY userid")
    for email, user_id in cursor.fetchall():
        try:
            user = Employee.objects.get(email=email)
        except Employee.DoesNotExist:
            print(f"User with email {email} not found.")
            continue

        avatar = liferay_fetch_avatar(url, user_id, p_auth, jsessionid)
        if avatar is None:
            continue

        file = upload_base64_avatar(email, avatar)

        user.avatar = f"/media/{file}"
        user.save()

        print(f"User with email {email} has been updated with avatar: {file}.")
        update_cnt += 1

    print(f"A total of {update_cnt} user avatars were imported")
