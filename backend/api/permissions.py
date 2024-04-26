from rest_framework import permissions
from rest_framework.permissions import IsAdminUser


class IsUserOrReadOnly(permissions.IsAuthenticatedOrReadOnly):

    def has_object_permission(self, request, view, obj):

        return (
            request.method in permissions.SAFE_METHODS
            or obj == request.user
        )


class IsAdminUserOrReadOnly(IsAdminUser):

    def has_permission(self, request, view):
        is_admin = super(
            IsAdminUserOrReadOnly,
            self
        ).has_permission(request, view)

        return request.method in permissions.SAFE_METHODS or is_admin
