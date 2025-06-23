from django.apps import AppConfig
from django.contrib.auth.signals import user_logged_out
from django.dispatch import receiver

from .metrics import session_depth


@receiver(user_logged_out)
def on_user_logout(sender, request, **kwargs):
    """
    Когда пользователь выходит, мы записываем итоговую глубину его сессии.
    """
    page_views = request.session.get('page_views_in_session', 0)
    if page_views > 0:
        session_depth.observe(page_views)
    # Очищаем счетчик, чтобы он не остался в сессии
    if 'page_views_in_session' in request.session:
        del request.session['page_views_in_session']


class HomepageConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "homepage"
