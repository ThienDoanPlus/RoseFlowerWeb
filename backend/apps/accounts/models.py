import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser

class Role(models.TextChoices):
    CUSTOMER = 'CUSTOMER', 'Khách hàng'
    STAFF = 'STAFF', 'Nhân viên tư vấn & Florist'
    ADMIN = 'ADMIN', 'Quản lý tiệm'

class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, db_index=True)
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.CUSTOMER,
        db_index=True
    )
    full_name = models.CharField(max_length=150, blank=True)
    phone_number = models.CharField(max_length=20, blank=True, db_index=True)
    avatar_url = models.CharField(max_length=500, blank=True)
    saved_address = models.TextField(blank=True)
    district = models.CharField(max_length=100, blank=True)
    city = models.CharField(max_length=100, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    class Meta:
        db_table = 'users_user'
        verbose_name = 'Người dùng'
        verbose_name_plural = 'Danh sách Người dùng'

    def __str__(self):
        return f"{self.email} ({self.get_role_display()})"

    @property
    def is_customer(self):
        return self.role == Role.CUSTOMER

    @property
    def is_staff_member(self):
        return self.role in [Role.STAFF, Role.ADMIN]

    @property
    def is_store_admin(self):
        return self.role == Role.ADMIN or self.is_superuser
