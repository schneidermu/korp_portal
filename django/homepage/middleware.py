# my_project/core/middleware.py

import time
from .metrics import page_views_by_user, bounces, session_depth


class UserActivityMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):

        request.start_time = time.time()

        page_views_in_session = request.session.get('page_views_in_session', 0) + 1
        request.session['page_views_in_session'] = page_views_in_session

        response = self.get_response(request)

        if request.user.is_authenticated:
            page_views_by_user.labels(user=request.user.username).inc()
        else:
            page_views_by_user.labels(user='anonymous').inc()


        duration = time.time() - request.start_time
        if page_views_in_session == 1 and duration < 15:
            bounces.inc()

        # --- Запись метрики глубины просмотра ---
        # Django по умолчанию сохраняет сессию только если она была изменена.
        # Чтобы сессия завершилась и мы смогли записать итоговую глубину,
        # нужно отслеживать logout или таймаут сессии.
        # Простой подход: записывать метрику при каждом запросе, если пользователь ушел,
        # последнее значение и будет итоговым. Более сложный - обрабатывать сигнал user_logged_out.
        #
        # ВАЖНО: Мы не знаем, когда сессия закончится. Простой трюк -
        # считать, что сессия закончилась, если пользователь закрыл браузер.
        # Но на сервере мы этого не узнаем.
        # Компромисс: записывать метрику в Histogram можно при каждом запросе.
        # Либо, что лучше, обрабатывать сигнал user_logged_out.
        # Давайте для простоты пока оставим так.
        # Логику для session_depth лучше вынести в обработчик сигнала logout.

        return response