import os
import sys
import json
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# pyrefly: ignore [missing-import]
import django
django.setup()

from apps.accounts.models import User, Role
from apps.catalog.models import Category, Flower
from apps.promotions.models import Voucher, DiscountType

def seed():
    print("Đang nạp dữ liệu từ thư mục production vào Django SQLite...")

    # Users
    admin_user, _ = User.objects.get_or_create(
        email='admin@roseflowers.vn',
        defaults={
            'username': 'admin@roseflowers.vn',
            'full_name': 'Lê Quốc Hưng (Quản lý)',
            'role': Role.ADMIN,
            'is_staff': True,
            'is_superuser': True,
        }
    )
    admin_user.set_password('Admin@123')
    admin_user.save()

    staff_user, _ = User.objects.get_or_create(
        email='florist.mai@roseflowers.vn',
        defaults={
            'username': 'florist.mai@roseflowers.vn',
            'full_name': 'Trần Thị Mai (Florist)',
            'role': Role.STAFF,
            'is_staff': True,
        }
    )
    staff_user.set_password('Staff@123')
    staff_user.save()

    customer_user, _ = User.objects.get_or_create(
        email='nguyenthiendoan2@gmail.com',
        defaults={
            'username': 'nguyenthiendoan2@gmail.com',
            'full_name': 'Nguyễn Thiên Đoan',
            'role': Role.CUSTOMER,
            'phone_number': '0908123456',
            'saved_address': '294 Phạm Văn Bạch, Phường Tân Sơn, TP.HCM',
        }
    )
    customer_user.set_password('Customer@123')
    customer_user.save()

    # Load generated products
    json_path = os.path.join(os.path.dirname(__file__), '../src/data/generated_products.json')
    with open(json_path, 'r', encoding='utf-8') as f:
        products = json.load(f)

    # Categories
    categories_def = [
        ('bo-hoa-mini', 'Bó Hoa Sáp Mini & Xinh Xắn (189k - 259k)', 1),
        ('bo-hoa-tieu-chuan', 'Bó Hoa Sáp Tiêu Chuẩn (279k - 359k)', 2),
        ('bo-hoa-cao-cap', 'Bó Hoa Sáp Thiết Kế Cao Cấp (459k - 559k)', 3),
        ('bo-hoa-dai-tiec', 'Bó Hoa Sáp Đại Khổng Lồ 99 Bông (679k)', 4),
    ]

    cat_objs = {}
    for cid, cname, order in categories_def:
        cat, _ = Category.objects.update_or_create(
            id=cid,
            defaults={'name': cname, 'display_order': order}
        )
        cat_objs[cid] = cat

    # Flowers
    for p in products:
        Flower.objects.update_or_create(
            id=p['id'],
            defaults={
                'name': p['name'],
                'botanical_name': p['botanicalName'],
                'category': cat_objs[p['categoryId']],
                'base_price': Decimal(str(p['basePrice'])),
                'sale_price': Decimal(str(p['salePrice'])) if p.get('salePrice') else None,
                'image_url': p['imageUrl'],
                'gallery': p['gallery'],
                'short_description': p['shortDescription'],
                'description': p['description'],
                'meaning': p['meaning'],
                'care_guide': p['careGuide'],
                'occasions': p.get('occasions', []),
                'recipients': p.get('recipients', []),
                'design_style': p.get('designStyle', 'bo-hoa'),
                'color_tone': p.get('colorTone', 'do-hong'),
                'flower_type': p.get('flowerType', 'hoa-hong'),
                'price_range_category': p.get('priceRangeCategory', '300k-500k'),
                'rating_avg': Decimal(str(p['ratingAvg'])),
                'reviews_count': p['reviewsCount'],
                'is_featured': p['isFeatured'],
                'is_in_stock': p['isInStock'],
            }
        )

    # Cleanup any old flowers not present in generated_products.json
    valid_flower_ids = [p['id'] for p in products]
    deleted_old, _ = Flower.objects.exclude(id__in=valid_flower_ids).delete()
    if deleted_old:
        print(f"Đã dọn dẹp {deleted_old} mẫu hoa cũ không thuộc thư mục production.")

    # Vouchers
    Voucher.objects.update_or_create(
        id='v-rose10',
        defaults={
            'code': 'ROSE10',
            'title': 'Chào Bạn Mới Tiệm Hoa Rose',
            'discount_type': DiscountType.PERCENT,
            'discount_value': Decimal('10'),
            'min_order_value': Decimal('300000'),
            'max_discount_amount': Decimal('100000'),
        }
    )

    Voucher.objects.update_or_create(
        id='v-womensday',
        defaults={
            'code': 'WOMENSDAY',
            'title': 'Quốc Tế Phụ Nữ 8/3',
            'discount_type': DiscountType.PERCENT,
            'discount_value': Decimal('20'),
            'min_order_value': Decimal('500000'),
            'max_discount_amount': Decimal('200000'),
            'is_holiday_special': True,
            'applicable_holiday': 'Quốc Tế Phụ Nữ 8/3',
        }
    )

    Voucher.objects.update_or_create(
        id='v-valentine',
        defaults={
            'code': 'VALENTINE142',
            'title': 'Mùa Yêu Valentine 14/2',
            'discount_type': DiscountType.PERCENT,
            'discount_value': Decimal('15'),
            'min_order_value': Decimal('500000'),
            'max_discount_amount': Decimal('150000'),
            'is_holiday_special': True,
            'applicable_holiday': 'Valentine 14/2',
        }
    )

    Voucher.objects.update_or_create(
        id='v-phunuvn',
        defaults={
            'code': 'PHUNUVN2010',
            'title': 'Phụ Nữ Việt Nam 20/10',
            'discount_type': DiscountType.PERCENT,
            'discount_value': Decimal('20'),
            'min_order_value': Decimal('600000'),
            'max_discount_amount': Decimal('200000'),
            'is_holiday_special': True,
            'applicable_holiday': 'Phụ Nữ VN 20/10',
        }
    )

    print(f"Đã nạp thành công {len(products)} sản phẩm hoa sáp vào Django database!")

if __name__ == '__main__':
    seed()
