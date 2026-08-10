from rest_framework.permissions import BasePermission


class IsAdminRole(BasePermission):
    """
    Permite acceso únicamente a usuarios autenticados cuyo rol sea 'Administrador'.
    """

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.rol == 'Administrador' or request.user.is_superuser)
        )