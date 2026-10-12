# pyrefly: ignore [missing-import]
from django.db import models

class Category(models.Model):
    id = models.SlugField(max_length=50, primary_key=True)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    icon_name = models.CharField(max_length=50, blank=True)
    display_order = models.IntegerField(default=0)

    class Meta:
        db_table = 'catalog_category'
        verbose_name = 'Danh mục hoa'
        verbose_name_plural = 'Danh sách Danh mục'
        ordering = ['display_order', 'name']

    def __str__(self):
        return self.name

class Flower(models.Model):
    id = models.SlugField(max_length=50, primary_key=True)
    name = models.CharField(max_length=200, db_index=True)
    botanical_name = models.CharField(max_length=200, blank=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='flowers')
    base_price = models.DecimalField(max_digits=12, decimal_places=2, db_index=True)
    sale_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    image_url = models.CharField(max_length=500)
    gallery = models.JSONField(default=list, blank=True)
    short_description = models.CharField(max_length=500, blank=True)
    description = models.TextField(blank=True)
    meaning = models.TextField(blank=True)
    care_guide = models.TextField(blank=True)
    occasions = models.JSONField(default=list, blank=True)
    recipients = models.JSONField(default=list, blank=True)
    design_style = models.CharField(max_length=50, blank=True, default='bo-hoa', db_index=True)
    color_tone = models.CharField(max_length=50, blank=True, default='do-hong', db_index=True)
    flower_type = models.CharField(max_length=50, blank=True, default='hoa-hong', db_index=True)
    price_range_category = models.CharField(max_length=50, blank=True, default='300k-500k', db_index=True)
    rating_avg = models.DecimalField(max_digits=3, decimal_places=2, default=5.0)
    reviews_count = models.IntegerField(default=0)
    is_featured = models.BooleanField(default=False)
    is_in_stock = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'catalog_flower'
        verbose_name = 'Sản phẩm hoa tươi'
        verbose_name_plural = 'Danh sách Hoa tươi'
        ordering = ['-is_featured', '-created_at']
        indexes = [
            models.Index(fields=['category', 'is_in_stock', 'base_price']),
        ]

    def __str__(self):
        return self.name

    @property
    def current_price(self):
        return self.sale_price if self.sale_price else self.base_price
