import json

with open('src/data/generated_products.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

categories = [
    {
        'id': 'tat-ca',
        'name': 'Tất cả hoa sáp',
        'description': f'Toàn bộ {len(products)} thiết kế hoa sáp nghệ thuật cao cấp lưu hương 3-5 năm tại cửa hàng 294 Phạm Văn Bạch',
        'flowerCount': len(products),
    },
    {
        'id': 'bo-hoa-mini',
        'name': 'Bó Hoa Sáp Mini & Xinh Xắn (189k - 259k)',
        'description': 'Kích thước nhỏ gọn, xinh xắn, quà tặng tốt nghiệp, bạn bè và học sinh sinh viên',
        'flowerCount': sum(1 for p in products if p['categoryId'] == 'bo-hoa-mini'),
    },
    {
        'id': 'bo-hoa-tieu-chuan',
        'name': 'Bó Hoa Sáp Tiêu Chuẩn (279k - 359k)',
        'description': 'Mẫu hoa bán chạy nhất cho sinh nhật, kỷ niệm và ngày lễ tình yêu',
        'flowerCount': sum(1 for p in products if p['categoryId'] == 'bo-hoa-tieu-chuan'),
    },
    {
        'id': 'bo-hoa-cao-cap',
        'name': 'Bó Hoa Sáp Thiết Kế Cao Cấp (459k - 559k)',
        'description': 'Phối giấy lụa Hàn Quốc xòe bồng bềnh, ruy băng nhung lụa và đèn LED ấm áp',
        'flowerCount': sum(1 for p in products if p['categoryId'] == 'bo-hoa-cao-cap'),
    },
    {
        'id': 'bo-hoa-dai-tiec',
        'name': 'Bó Hoa Sáp Đại Khổng Lồ 99 Bông (679k)',
        'description': '99 bông hoa sáp đại tiệc tình yêu vĩnh cửu, đường kính lớn 75cm ôm trọn vòng tay',
        'flowerCount': sum(1 for p in products if p['categoryId'] == 'bo-hoa-dai-tiec'),
    },
]

vouchers = [
    {
        'code': 'ROSE10',
        'title': 'Chào Bạn Mới Tiệm Hoa Rose',
        'description': 'Giảm ngay 10% tối đa 100.000 ₫ cho đơn hàng hoa sáp đầu tiên tại 294 Phạm Văn Bạch',
        'discountType': 'PERCENT',
        'discountValue': 10,
        'minOrderValue': 300000,
        'maxDiscountAmount': 100000,
        'validUntil': '2026-12-31',
    },
    {
        'code': 'WOMENSDAY',
        'title': 'Mừng Quốc Tế Phụ Nữ 8/3',
        'description': 'Giảm 20% tối đa 200.000 ₫ tôn vinh vẻ đẹp rạng rỡ của người phụ nữ bạn yêu thương',
        'discountType': 'PERCENT',
        'discountValue': 20,
        'minOrderValue': 500000,
        'maxDiscountAmount': 200000,
        'isHolidaySpecial': True,
        'holidayTag': 'Quốc Tế Phụ Nữ 8/3',
        'validUntil': '2026-12-31',
    },
    {
        'code': 'VALENTINE142',
        'title': 'Mùa Yêu Valentine 14/2',
        'description': 'Giảm 15% tối đa 150.000 ₫ cho các bó hoa sáp tình yêu vĩnh cửu không bao giờ phai tàn',
        'discountType': 'PERCENT',
        'discountValue': 15,
        'minOrderValue': 500000,
        'maxDiscountAmount': 150000,
        'isHolidaySpecial': True,
        'holidayTag': 'Valentine 14/2',
        'validUntil': '2026-12-31',
    },
    {
        'code': 'PHUNUVN2010',
        'title': 'Tri Ân Phụ Nữ Việt Nam 20/10',
        'description': 'Giảm 20% tối đa 200.000 ₫ cho đơn hoa sáp trao gửi mẹ, cô giáo và người thương',
        'discountType': 'PERCENT',
        'discountValue': 20,
        'minOrderValue': 600000,
        'maxDiscountAmount': 200000,
        'isHolidaySpecial': True,
        'holidayTag': 'Phụ Nữ VN 20/10',
        'validUntil': '2026-12-31',
    },
    {
        'code': 'SIEUDAIDON',
        'title': 'Chiết Khấu Đặt Số Lượng Lớn',
        'description': 'Giảm ngay 10% khi đặt từ 3 bó hoa sáp trở lên cho tiệc kỷ niệm & sự kiện công ty',
        'discountType': 'PERCENT',
        'discountValue': 10,
        'minOrderValue': 800000,
        'minQuantity': 3,
        'validUntil': '2026-12-31',
    },
    {
        'code': 'FREESHIPROSE',
        'title': 'Miễn Phí Giao Hoa Sáp Tân Sơn',
        'description': 'Freeship hỏa tốc cho đơn hàng quanh khu vực 294 Phạm Văn Bạch, Tân Sơn, TP.HCM',
        'discountType': 'FIXED',
        'discountValue': 25000,
        'minOrderValue': 350000,
        'validUntil': '2026-12-31',
    },
]

branches = [
    {
        'id': 'rose-flagship-tan-son',
        'name': 'Rose - Flagship Store Phạm Văn Bạch, TP.HCM',
        'address': '294 Phạm Văn Bạch, Phường Tân Sơn',
        'district': 'Phường Tân Sơn',
        'city': 'TP. Hồ Chí Minh',
        'phone': '0888 208 306',
        'operatingHours': '08:00 - 22:00 (Mở cửa tất cả các ngày trong tuần)',
        'lat': 10.8258,
        'lng': 106.6385,
    },
    {
        'id': 'rose-studio-go-vap',
        'name': 'Rose - Kho Sỉ & Xưởng Gia Công Quang Trung',
        'address': '680 Quang Trung, Phường 11, Quận Gò Vấp',
        'district': 'Quận Gò Vấp',
        'city': 'TP. Hồ Chí Minh',
        'phone': '0888 208 306',
        'operatingHours': '08:30 - 21:00',
        'lat': 10.8385,
        'lng': 106.6542,
    },
]

# Generate reviews dictionary
reviews_map = {}
for idx, p in enumerate(products[:15]):
    pid = p['id']
    reviews_map[pid] = [
        {
            'id': f"rev-{idx}-1",
            'flowerId': pid,
            'authorName': 'Khách ghé 294 Phạm Văn Bạch',
            'rating': 5,
            'comment': f"Hoa sáp thực tế y chang trong hình! Mùi thơm hoa hồng dịu mát, giấy gói xếp ly bồng bềnh rất chỉn chu. Giá {p['basePrice']:,.0f}đ quá hợp lý.",
            'date': '12/10/2026',
            'isVerifiedBuyer': True,
            'isApproved': True,
        },
        {
            'id': f"rev-{idx}-2",
            'flowerId': pid,
            'authorName': 'Nguyễn Phương Thảo',
            'rating': 5,
            'comment': "Giao hỏa tốc đúng 45 phút là shipper đã mang tới tận sảnh chung cư. Shop nắn nót viết thiệp tay rất đẹp. Mọi người nên mua ủng hộ nhé!",
            'date': '10/10/2026',
            'isVerifiedBuyer': True,
            'isApproved': True,
        }
    ]

# Generate typescript file
ts_content = f"""/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {{ BranchLocation, Category, Flower, Review, Voucher }} from '../types';

export const CATEGORIES: Category[] = {json.dumps(categories, ensure_ascii=False, indent=2)};

export const FLOWERS: Flower[] = {json.dumps(products, ensure_ascii=False, indent=2)};

export const VOUCHERS: Voucher[] = {json.dumps(vouchers, ensure_ascii=False, indent=2)};

export const BRANCHES: BranchLocation[] = {json.dumps(branches, ensure_ascii=False, indent=2)};

export const INITIAL_REVIEWS: Record<string, Review[]> = {json.dumps(reviews_map, ensure_ascii=False, indent=2)};
"""

with open('src/data/mockData.ts', 'w', encoding='utf-8') as f:
    f.write(ts_content)

print(f"Đã cập nhật thành công src/data/mockData.ts với {len(products)} sản phẩm hoa sáp từ thư mục production!")
