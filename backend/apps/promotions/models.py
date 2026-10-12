from django.db import models

class DiscountType(models.TextChoices):
    PERCENT = 'PERCENT', 'Phần trăm (%)'
    FIXED_AMOUNT = 'FIXED_AMOUNT', 'Số tiền cố định (₫)'

class Voucher(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    code = models.CharField(max_length=50, unique=True, db_index=True)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    discount_type = models.CharField(
        max_length=20,
        choices=DiscountType.choices,
        default=DiscountType.PERCENT
    )
    discount_value = models.DecimalField(max_digits=12, decimal_places=2)
    min_order_value = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    max_discount_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    min_quantity = models.IntegerField(default=1)
    is_holiday_special = models.BooleanField(default=False)
    applicable_holiday = models.CharField(max_length=50, null=True, blank=True)
    valid_from = models.DateTimeField(null=True, blank=True)
    valid_to = models.DateTimeField(null=True, blank=True)
    usage_limit = models.IntegerField(null=True, blank=True)
    used_count = models.IntegerField(default=0)

    class Meta:
        db_table = 'promotions_voucher'
        verbose_name = 'Mã giảm giá'
        verbose_name_plural = 'Danh sách Voucher'

    def __str__(self):
        return f"{self.code} - {self.title}"
