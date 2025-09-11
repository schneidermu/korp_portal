from rest_framework import permissions
from rest_framework.permissions import IsAdminUser


def _get_model_from_view(view):
    """
    Attempts to determine the model class associated with a view.
    """
    queryset = None
    if hasattr(view, "get_queryset"):
        try:
            queryset = view.get_queryset()
        except Exception:
            pass
    elif hasattr(view, "queryset"):
        queryset = view.queryset

    if queryset is not None:
        return queryset.model

    serializer_class = None
    if hasattr(view, "get_serializer_class"):
        try:
            serializer_class = view.get_serializer_class()
        except Exception:
            pass
    elif hasattr(view, "serializer_class"):
        serializer_class = view.serializer_class

    if (
        serializer_class
        and hasattr(serializer_class, "Meta")
        and hasattr(serializer_class.Meta, "model")
    ):
        return serializer_class.Meta.model

    return None


class IsUserOrReadOnly(permissions.IsAuthenticatedOrReadOnly):
    def has_object_permission(self, request, view, obj):
        return (
            request.method in permissions.SAFE_METHODS
            or obj == request.user
            or request.user.is_staff
        )


class IsAdminUserOrReadOnly(IsAdminUser):
    """
    Permission class that provides:
    - Full access to admin users (is_staff=True).
    - Read-only access for any user (authenticated or anonymous) for SAFE_METHODS.
    - For 'POST' (create) requests by authenticated non-admins:
        Checks for 'add_modelname' model-level permission.
    - For object-level 'PUT', 'PATCH', 'DELETE' requests (and 'POST' if acting on an object)
      by authenticated non-admins:
        Checks for 'change_modelname' or 'delete_modelname' object-level permissions.
    """

    ACTION_TO_PERMISSION_VERB_MODEL = {
        "create": "add",
    }
    METHOD_TO_PERMISSION_VERB_MODEL = {
        "POST": "add",
    }

    ACTION_TO_PERMISSION_VERB_OBJECT = {
        "update": "change",
        "partial_update": "change",
        "destroy": "delete",
    }
    METHOD_TO_PERMISSION_VERB_OBJECT = {
        "PUT": "change",
        "PATCH": "change",
        "DELETE": "delete",
        "POST": "change",
    }

    def has_permission(self, request, view):
        is_admin = super().has_permission(request, view)

        if is_admin:
            return True

        if request.method in permissions.SAFE_METHODS:
            return True

        if not request.user or not request.user.is_authenticated:
            return False

        perm_verb_model = None
        view_action = getattr(view, "action", None)

        if view_action:
            perm_verb_model = self.ACTION_TO_PERMISSION_VERB_MODEL.get(view_action)

        if not perm_verb_model:
            perm_verb_model = self.METHOD_TO_PERMISSION_VERB_MODEL.get(request.method)

        if perm_verb_model:
            model_cls = _get_model_from_view(view)
            if not model_cls:
                return False

            permission_codename = f"{model_cls._meta.app_label}.{perm_verb_model}_{model_cls._meta.model_name}"
            return request.user.has_perm(permission_codename)

        return True

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS or obj == request.user:
            return True

        if super().has_permission(request, view):
            return True

        if not request.user or not request.user.is_authenticated:
            return False

        perm_verb_object = None
        view_action = getattr(view, "action", None)
        if view_action:
            perm_verb_object = self.ACTION_TO_PERMISSION_VERB_OBJECT.get(view_action)

        if not perm_verb_object:
            perm_verb_object = self.METHOD_TO_PERMISSION_VERB_OBJECT.get(request.method)

        if not perm_verb_object:
            return False

        model_meta = obj._meta
        permission_codename = (
            f"{model_meta.app_label}.{perm_verb_object}_{model_meta.model_name}"
        )

        return request.user.has_perm(permission_codename)
