import logging

api_logger = logging.getLogger("api_logger")


class ApiLoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        user = request.user if request.user.is_authenticated else "Anonymous"

        action = f"{request.method} {request.path}"

        log_message = f"User: {user}, Action: {action}"

        api_logger.info(log_message)

        return response
