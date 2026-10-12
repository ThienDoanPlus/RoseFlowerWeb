from django.db import models
from apps.orders.models import Order

class PaymentMethod(models.TextChoices):
    VIETQR = 'VIETQR', 'VietQR (Napas 24/7)'
    MOMO = 'MOMO', 'Ví điện tử MoMo'
    VNPAY = 'VNPAY', 'Cổng VNPay'
    ZALOPAY = 'ZALOPAY', 'Ví ZaloPay'
    COD = 'COD', 'Thanh toán khi nhận hoa'

class PaymentStatus(models.TextChoices):
    PENDING = 'PENDING', 'Chờ thanh toán'
    SUCCESS = 'SUCCESS', 'Thành công'
    FAILED = 'FAILED', 'Thất bại'

class Transaction(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='transactions')
    method = models.CharField(max_length=20, choices=PaymentMethod.choices, default=PaymentMethod.VIETQR)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.PENDING)
    transaction_code = models.CharField(max_length=100, db_index=True)
    payment_gateway_payload = models.JSONField(default=dict, blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'payments_transaction'
        verbose_name = 'Giao dịch thanh toán'
        verbose_name_plural = 'Danh sách Giao dịch'

    def __str__(self):
        return f"{self.id} - {self.method} ({self.get_status_display()})"
