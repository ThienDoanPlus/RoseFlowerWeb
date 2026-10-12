from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Review
from .serializers import ReviewSerializer, ReviewCreateSerializer
from apps.accounts.permissions import IsAdminUser

class ReviewViewSet(viewsets.ModelViewSet):
    """
    API Đánh giá sản phẩm:
    - GET: Xem đánh giá đã phê duyệt
    - POST: Tạo đánh giá (AllowAny / Auth)
    - PATCH / DELETE: IsAdminUser kiểm duyệt
    """
    queryset = Review.objects.all()

    def get_serializer_class(self):
        if self.action == 'create':
            return ReviewCreateSerializer
        return ReviewSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'create']:
            return [permissions.AllowAny()]
        return [IsAdminUser()]

    def get_queryset(self):
        qs = Review.objects.all()
        flower_id = self.request.query_params.get('flower')
        if flower_id:
            qs = qs.filter(flower_id=flower_id)
        # Nếu không phải admin thì chỉ lấy bài đã duyệt
        if not (self.request.user and self.request.user.is_authenticated and self.request.user.role == 'ADMIN'):
            qs = qs.filter(is_approved=True)
        return qs
