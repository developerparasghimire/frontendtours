from rest_framework.permissions import BasePermission
from apps.users.models import Role

class IsSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == Role.SUPER_ADMIN)

class IsAdminOnly(BasePermission):
    """Grants access to SUPER_ADMIN and ADMIN roles only (not STAFF)."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in [Role.SUPER_ADMIN, Role.ADMIN])

class IsAdminOrStaff(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in [Role.SUPER_ADMIN, Role.ADMIN, Role.STAFF])

class IsOwnerOrAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.role in [Role.SUPER_ADMIN, Role.ADMIN]:
            return True
        return obj.user == request.user
