import uuid
from django.db import models
from django.conf import settings
from apps.catalog.models import Flower

class Review(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    flower = models.ForeignKey(Flower, on_delete=models.CASCADE, related_name='reviews', db_index=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    author_name = models.CharField(max_length=150)
    author_avatar = models.CharField(max_length=500, blank=True)
    rating = models.IntegerField(default=5) # 1-5
    comment = models.TextField()
    is_verified_buyer = models.BooleanField(default=True)
    is_approved = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'reviews_review'
        verbose_name = 'Đánh giá sản phẩm'
        verbose_name_plural = 'Danh sách Đánh giá'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.author_name} ({self.rating}★) - {self.flower.name}"
