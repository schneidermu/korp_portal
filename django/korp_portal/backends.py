import ldap
from django_auth_ldap.backend import LDAPBackend, _LDAPUser, _report_error, logger
import requests
import os

url = os.getenv("CHALLENGE_URL", "0")


class _CustomLDAPUser(_LDAPUser):
    def authenticate(self, password, cookies):
        """
        Authenticates against the LDAP directory and returns the corresponding
        User object if successful. Returns None on failure.
        """
        user = None

        try:
            data = {
                "p_auth": password
            }
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
