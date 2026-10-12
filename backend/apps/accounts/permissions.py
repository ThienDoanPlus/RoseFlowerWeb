from rest_framework.permissions import BasePermission
from .models import Role

class IsCustomer(BasePermission):
    """
    Cho phép người dùng có vai trò CUSTOMER hoặc khách vãng lai đã xác thực.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == Role.CUSTOMER)

class IsStaffMember(BasePermission):
    """
    Cho phép Nhân viên tư vấn, Florist và Admin truy cập điều phối đơn.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and
            (request.user.role in [Role.STAFF, Role.ADMIN] or request.user.is_staff or request.user.is_superuser)
        )

class IsAdminUser(BasePermission):
    """
    Toàn quyền dành cho Quản lý tiệm (ADMIN).
    """
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and
            (request.user.role == Role.ADMIN or request.user.is_superuser)
        )
