import uuid
from django.db import models
from django.conf import settings
from apps.catalog.models import Flower

class OrderStatus(models.TextChoices):
    PENDING = 'PENDING', 'Chờ xử lý'
    ARRANGING = 'ARRANGING', 'Đang cắm hoa & In thiệp'
    SHIPPING = 'SHIPPING', 'Đã bàn giao shipper'
    DELIVERED = 'DELIVERED', 'Giao thành công'
    CANCELLED = 'CANCELLED', 'Đã hủy'

class SizeVariant(models.TextChoices):
    STANDARD = 'STANDARD', 'Standard'
    DELUXE = 'DELUXE', 'Deluxe'
    PREMIUM = 'PREMIUM', 'Premium'

class Order(models.Model):
    id = models.CharField(max_length=50, primary_key=True, db_index=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='orders'
    )
    assigned_staff = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_orders'
    )
    customer_name = models.CharField(max_length=150)
    customer_phone = models.CharField(max_length=20, db_index=True)
    customer_email = models.CharField(max_length=255, blank=True)
    shipping_address = models.TextField()
    delivery_district = models.CharField(max_length=100, blank=True)
    delivery_city = models.CharField(max_length=100, blank=True)
    branch_origin_id = models.CharField(max_length=50, default='rose-flagship-tan-son')
    distance_km = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    shipping_fee = models.DecimalField(max_digits=12, decimal_places=2, default=0.0)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.0)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    voucher_code = models.CharField(max_length=50, null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=OrderStatus.choices,
        default=OrderStatus.PENDING,
        db_index=True
    )
    greeting_message = models.TextField(blank=True)
    sender_signature = models.CharField(max_length=100, blank=True)
    florist_notes = models.TextField(blank=True)
    delivery_date = models.DateField(null=True, blank=True)
    delivery_time_slot = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'orders_order'
        verbose_name = 'Đơn hàng'
        verbose_name_plural = 'Danh sách Đơn hàng'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'created_at']),
        ]

    def __str__(self):
        return f"#{self.id} - {self.customer_name} ({self.get_status_display()})"

class OrderItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    flower = models.ForeignKey(Flower, on_delete=models.PROTECT)
    flower_name = models.CharField(max_length=200)
    size_variant = models.CharField(
        max_length=20,
        choices=SizeVariant.choices,
        default=SizeVariant.STANDARD
    )
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    quantity = models.IntegerField(default=1)
    total_price = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        db_table = 'orders_orderitem'
        verbose_name = 'Mục chi tiết đơn'
        verbose_name_plural = 'Chi tiết đơn hàng'

    def __str__(self):
        return f"{self.flower_name} x{self.quantity}"
