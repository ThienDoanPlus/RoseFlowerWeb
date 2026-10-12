# pyrefly: ignore [missing-import]
from rest_framework import viewsets, permissions
# pyrefly: ignore [missing-import]
from django.db.models import Q
from .models import Category, Flower
from .serializers import CategorySerializer, FlowerListSerializer, FlowerDetailSerializer
# pyrefly: ignore [missing-import]
from apps.accounts.permissions import IsAdminUser

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET /api/categories/
    Lấy danh sách danh mục hoa (AllowAny)
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]

from rest_framework.decorators import action
from rest_framework.response import Response

class FlowerViewSet(viewsets.ModelViewSet):
    """
    API Quản lý sản phẩm hoa tươi:
    - GET: AllowAny
    - POST, PUT, DELETE: IsAdminUser (RBAC Matrix)
    - Hỗ trợ 6 chiều lọc: Occasion, Recipient, Design Style, Price Range, Color Tone, Flower Type
    """
    queryset = Flower.objects.all()
    pagination_class = None  # Trả về toàn bộ danh sách khi frontend yêu cầu danh mục trực tiếp

    def get_serializer_class(self):
        if self.action == 'list':
            return FlowerListSerializer
        return FlowerDetailSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'filter_options']:
            return [permissions.AllowAny()]
        return [IsAdminUser()]

    def get_queryset(self):
        qs = Flower.objects.all().select_related('category')
        params = self.request.query_params

        # 1. Danh mục chính
        category = params.get('category') or params.get('categoryId')
        if category and category != 'tat-ca':
            qs = qs.filter(category_id=category)

        # 2. Tìm kiếm tự do
        search = params.get('search')
        if search:
            qs = qs.filter(
                Q(name__icontains=search) |
                Q(botanical_name__icontains=search) |
                Q(meaning__icontains=search) |
                Q(short_description__icontains=search)
            )

        # 3. Lọc theo Dịp tặng (Occasion)
        occasion = params.get('occasion')
        if occasion and occasion != 'tat-ca':
            qs = qs.filter(occasions__icontains=occasion)

        # 4. Lọc theo Người nhận (Recipient)
        recipient = params.get('recipient')
        if recipient and recipient != 'tat-ca':
            qs = qs.filter(recipients__icontains=recipient)

        # 5. Lọc theo Kiểu dáng thiết kế (Style / Format)
        design_style = params.get('design_style') or params.get('designStyle')
        if design_style and design_style != 'tat-ca':
            qs = qs.filter(design_style=design_style)

        # 6. Lọc theo Mức giá (Price Range Category hoặc min_price / max_price)
        price_cat = params.get('price_range_category') or params.get('priceRangeCategory') or params.get('priceRange')
        if price_cat and price_cat != 'tat-ca':
            qs = qs.filter(price_range_category=price_cat)

        min_price = params.get('min_price') or params.get('minPrice')
        max_price = params.get('max_price') or params.get('maxPrice')
        if min_price:
            qs = qs.filter(base_price__gte=min_price)
        if max_price:
            qs = qs.filter(base_price__lte=max_price)

        # 7. Lọc theo Tone màu (Color Palette)
        color_tone = params.get('color_tone') or params.get('colorTone')
        if color_tone and color_tone != 'tat-ca':
            qs = qs.filter(color_tone=color_tone)

        # 8. Lọc theo Loại hoa chính (Flower Type)
        flower_type = params.get('flower_type') or params.get('flowerType')
        if flower_type and flower_type != 'tat-ca':
            qs = qs.filter(flower_type=flower_type)

        # 9. Sắp xếp (Sort)
        sort_by = params.get('sort_by') or params.get('sortBy')
        if sort_by == 'price-asc':
            qs = qs.order_by('base_price')
        elif sort_by == 'price-desc':
            qs = qs.order_by('-base_price')
        elif sort_by == 'rating':
            qs = qs.order_by('-rating_avg')

        return qs

    @action(detail=False, methods=['get'], url_path='filters')
    def filter_options(self, request):
        """
        GET /api/flowers/filters/
        Trả về danh sách 6 chiều lọc chính theo nghiệp vụ
        """
        filters_config = {
            'occasions': [
                {'id': 'tat-ca', 'name': 'Tất cả các dịp'},
                {'id': 'sinh-nhat', 'name': 'Sinh nhật (Bạn bè, người yêu, ba mẹ, đồng nghiệp)'},
                {'id': 'ky-niem', 'name': 'Kỷ niệm / Lãng mạn (Ngày cưới, tỏ tình, kỷ niệm ngày yêu)'},
                {'id': 'ngay-le', 'name': 'Ngày lễ lớn (8/3, 20/10, 14/2, 20/11, Giáng sinh, Tết)'},
                {'id': 'khai-truong', 'name': 'Chúc mừng / Khai trương (Thăng chức, tốt nghiệp, khai trương)'},
                {'id': 'chia-buon', 'name': 'Chia buồn / Tang lễ (Vòng hoa kính viếng, tone trang nhã)'},
                {'id': 'ngay-thuong', 'name': 'Ngày thường / Tặng bất ngờ (“để làm lành”)'},
            ],
            'recipients': [
                {'id': 'tat-ca', 'name': 'Tất cả người nhận'},
                {'id': 'nguoi-yeu', 'name': 'Người yêu / Crush (Lãng mạn, ngọt ngào)'},
                {'id': 'vo-chong', 'name': 'Vợ / Chồng'},
                {'id': 'me-ba', 'name': 'Mẹ / Bà (Ấm áp, kính trọng)'},
                {'id': 'doi-tac', 'name': 'Sếp / Đối tác / Khách hàng (Sang trọng, lịch sự)'},
                {'id': 'ban-be', 'name': 'Bạn bè / Đồng nghiệp (Trẻ trung, năng động)'},
            ],
            'designStyles': [
                {'id': 'tat-ca', 'name': 'Tất cả kiểu dáng'},
                {'id': 'bo-hoa', 'name': 'Bó hoa cầm tay (Tiện tặng trực tiếp, chụp ảnh)'},
                {'id': 'gio-hop', 'name': 'Giỏ hoa / Hộp hoa (Flower box để bàn, sang trọng)'},
                {'id': 'lang-ke', 'name': 'Lẵng hoa / Kệ hoa lớn (Khai trương, sự kiện, hội nghị)'},
                {'id': 'chau-hoa', 'name': 'Chậu lan hồ điệp / Chậu hoa cao cấp (Bền lâu)'},
            ],
            'priceRanges': [
                {'id': 'tat-ca', 'name': 'Tất cả mức giá', 'min': 0, 'max': 99999999},
                {'id': 'duoi-300k', 'name': 'Dưới 300.000đ (Học sinh, sinh viên, tặng bạn bè)', 'min': 0, 'max': 299999},
                {'id': '300k-500k', 'name': '300.000đ – 500.000đ (Phổ biến, dễ mua)', 'min': 300000, 'max': 500000},
                {'id': '500k-1tr', 'name': '500.000đ – 1.000.000đ (Đẹp, trang trọng)', 'min': 500000, 'max': 1000000},
                {'id': 'tren-1tr', 'name': 'Trên 1.000.000đ (Cao cấp, hoa đại tiệc)', 'min': 1000001, 'max': 99999999},
            ],
            'colorTones': [
                {'id': 'tat-ca', 'name': 'Tất cả tone màu'},
                {'id': 'pastel', 'name': 'Tone Pastel (Nhẹ nhàng, hiện đại, Hàn Quốc)'},
                {'id': 'do-hong', 'name': 'Tone Đỏ / Hồng (Nồng nàn, yêu thương)'},
                {'id': 'vang-cam', 'name': 'Tone Vàng / Cam (Rực rỡ, năng lượng, khai trương)'},
                {'id': 'trang', 'name': 'Tone Trắng / Tinh khôi (Thanh lịch, trang nhã)'},
                {'id': 'xanh-tim', 'name': 'Tone Xanh / Tím (Hoàng gia, chung thủy)'},
            ],
            'flowerTypes': [
                {'id': 'tat-ca', 'name': 'Tất cả loại hoa'},
                {'id': 'hoa-hong', 'name': 'Hoa hồng sáp (Tình yêu vĩnh cửu)'},
                {'id': 'tulip', 'name': 'Hoa tulip sáp (Kiêu sa, thanh thuần)'},
                {'id': 'huong-duong', 'name': 'Hoa hướng dương sáp (Ấm áp, rực rỡ)'},
                {'id': 'cam-chuong', 'name': 'Hoa cẩm chướng / Cẩm tú cầu sáp (Kính trọng)'},
                {'id': 'baby', 'name': 'Hoa baby (Thuần khiết, mộng mơ)'},
                {'id': 'mix', 'name': 'Mix nhiều loại hoa (Nghệ thuật)'},
            ],
        }
        return Response(filters_config)
