import unittest
from unittest.mock import Mock
from apps.accounts.models import Role
from apps.accounts.permissions import IsCustomer, IsStaffMember, IsAdminUser

class DummyUser:
    def __init__(self, role, is_authenticated=True, is_staff=False, is_superuser=False):
        self.role = role
        self.is_authenticated = is_authenticated
        self.is_staff = is_staff
        self.is_superuser = is_superuser

class RBACPermissionsTestCase(unittest.TestCase):
    def setUp(self):
        self.is_customer = IsCustomer()
        self.is_staff = IsStaffMember()
        self.is_admin = IsAdminUser()
        self.view = Mock()

    def test_customer_permissions(self):
        """Khách hàng (CUSTOMER) chỉ có quyền IsCustomer"""
        request = Mock(user=DummyUser(Role.CUSTOMER))
        self.assertTrue(self.is_customer.has_permission(request, self.view))
        self.assertFalse(self.is_staff.has_permission(request, self.view))
        self.assertFalse(self.is_admin.has_permission(request, self.view))

    def test_staff_permissions(self):
        """Nhân viên (STAFF) có quyền IsStaffMember nhưng KHÔNG có quyền IsAdminUser"""
        request = Mock(user=DummyUser(Role.STAFF))
        self.assertFalse(self.is_customer.has_permission(request, self.view))
        self.assertTrue(self.is_staff.has_permission(request, self.view))
        self.assertFalse(self.is_admin.has_permission(request, self.view))

    def test_admin_permissions(self):
        """Quản lý tiệm (ADMIN) có quyền IsAdminUser và IsStaffMember"""
        request = Mock(user=DummyUser(Role.ADMIN))
        self.assertTrue(self.is_staff.has_permission(request, self.view))
        self.assertTrue(self.is_admin.has_permission(request, self.view))

    def test_unauthenticated_user_denied(self):
        """Khách chưa đăng nhập bị từ chối mọi quyền phân quyền nội bộ"""
        request = Mock(user=DummyUser(None, is_authenticated=False))
        self.assertFalse(self.is_customer.has_permission(request, self.view))
        self.assertFalse(self.is_staff.has_permission(request, self.view))
        self.assertFalse(self.is_admin.has_permission(request, self.view))

if __name__ == '__main__':
    unittest.main()
