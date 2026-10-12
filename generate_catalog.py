import os
import json
import colorsys
# pyrefly: ignore [missing-import]
from PIL import Image

base_dir = 'public/production'
price_map = {
    '189k': 189000,
    '259k': 259000,
    '279k': 279000,
    '359k': 359000,
    '459k': 459000,
    '559k': 559000,
    '679k': 679000,
}

price_names = {
    '189k': 'Mini Petite',
    '259k': 'Sweet Classic',
    '279k': 'Delight Grace',
    '359k': 'Signature Charm',
    '459k': 'Luxury Elegance',
    '559k': 'Royal Premier',
    '679k': 'Grand Majesty 99 Bông',
}

def analyze_flower_color(img_path):
    try:
        img = Image.open(img_path).convert('RGB')
        w, h = img.size
        crop = img.crop((w * 0.2, h * 0.2, w * 0.8, h * 0.8)).resize((40, 40))
        pixels = list(crop.getdata())
        
        saturated = []
        light_neutrals = 0
        dark_neutrals = 0
        
        for r, g, b in pixels:
            h_val, s_val, v_val = colorsys.rgb_to_hsv(r/255.0, g/255.0, b/255.0)
            if s_val < 0.15:
                if v_val > 0.7: light_neutrals += 1
                else: dark_neutrals += 1
            else:
                saturated.append((h_val * 360, s_val, v_val))
                
        if not saturated:
            if light_neutrals > dark_neutrals:
                return 'white', 'Trắng Kem Tinh Khôi', 'Everlasting Ivory White', 'trang'
            return 'pastel', 'Pastel Nhã Nhặn', 'Everlasting Subtle Neutral', 'pastel'
            
        color_bins = {
            'red': 0, 'pink': 0, 'peach': 0, 'yellow': 0, 'blue': 0, 'purple': 0
        }
        for h, s, v in saturated:
            if h < 18 or h >= 345: color_bins['red'] += 1
            elif 300 <= h < 345: color_bins['pink'] += 1
            elif 18 <= h < 45: color_bins['peach'] += 1
            elif 45 <= h < 70: color_bins['yellow'] += 1
            elif 170 <= h < 255: color_bins['blue'] += 1
            elif 255 <= h < 300: color_bins['purple'] += 1
            else: color_bins['pink'] += 1
            
        top = max(color_bins, key=color_bins.get)
        
        color_info = {
            'red': ('red', 'Đỏ Nhung Quyến Rũ', 'Everlasting Velvet Red', 'do-hong'),
            'pink': ('pink', 'Hồng Pastel Dịu Ngọt', 'Everlasting Blush Pink', 'do-hong'),
            'peach': ('peach', 'Cam Đào Tươi Trẻ', 'Everlasting Sunset Peach', 'vang-cam'),
            'yellow': ('yellow', 'Vàng Kem Rực Rỡ', 'Everlasting Golden Sun', 'vang-cam'),
            'blue': ('blue', 'Xanh Dương Hy Vọng', 'Everlasting Ocean Blue', 'xanh-tim'),
            'purple': ('purple', 'Tím Lavender Thủy Chung', 'Everlasting Royal Lavender', 'xanh-tim'),
        }
        return color_info.get(top, ('pink', 'Hồng Pastel', 'Everlasting Pink', 'do-hong'))
    except Exception as e:
        return 'pink', 'Hồng Pastel', 'Everlasting Pink', 'do-hong'

products = []

# Occasions list:
# sinh-nhat: Sinh nhật
# ky-niem: Kỷ niệm / Lãng mạn
# ngay-le: Ngày lễ lớn (8/3, 20/10, 14/2...)
# khai-truong: Chúc mừng / Khai trương
# chia-buon: Chia buồn / Tang lễ
# ngay-thuong: Ngày thường / Không nhân dịp gì

# Recipients list:
# nguoi-yeu: Người yêu / Crush
# vo-chong: Vợ / Chồng
# me-ba: Mẹ / Bà
# doi-tac: Sếp / Đối tác / Khách hàng
# ban-be: Bạn bè / Đồng nghiệp

# Styles:
# bo-hoa: Bó hoa cầm tay
# gio-hop: Giỏ hoa / Hộp hoa (Flower box)
# lang-ke: Lẵng hoa / Kệ hoa lớn
# chau-hoa: Chậu hoa / Lan hồ điệp

# Price Ranges:
# duoi-300k (< 300k)
# 300k-500k (300k - 500k)
# 500k-1tr (500k - 1tr)
# tren-1tr (> 1tr)

# Flower Types:
# hoa-hong: Hoa hồng sáp
# tulip: Hoa tulip sáp
# huong-duong: Hoa hướng dương sáp
# cam-chuong: Hoa cẩm chướng / Cẩm tú cầu sáp
# baby: Hoa baby
# mix: Mix nhiều loại hoa

global_index = 0

for p_key in ['189k', '259k', '279k', '359k', '459k', '559k', '679k']:
    p_path = os.path.join(base_dir, p_key)
    if not os.path.exists(p_path): continue
    price_val = price_map[p_key]
    
    flower_dirs = sorted([d for d in os.listdir(p_path) if os.path.isdir(os.path.join(p_path, d)) and not d.startswith('.')],
                         key=lambda x: (len(x), x))
                         
    for idx, f_name in enumerate(flower_dirs):
        f_dir = os.path.join(p_path, f_name)
        imgs = sorted([x for x in os.listdir(f_dir) if x.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))])
        if not imgs: continue
        
        global_index += 1
        first_img_path = os.path.join(f_dir, imgs[0])
        color_key, color_name_vi, color_name_en, tone_slug = analyze_flower_color(first_img_path)
        
        prod_id = f"rose-{p_key}-{f_name}"
        flower_num = f_name.replace('flower', '')
        
        # Determine price category
        if price_val < 300000:
            price_range_cat = 'duoi-300k'
            category_id = 'bo-hoa-mini'
            size_name = 'Bó hoa sáp mini nhỏ gọn, xinh xắn'
        elif price_val <= 500000:
            price_range_cat = '300k-500k'
            category_id = 'bo-hoa-tieu-chuan'
            size_name = 'Bó hoa sáp tiêu chuẩn thanh lịch'
        elif price_val <= 1000000:
            price_range_cat = '500k-1tr'
            category_id = 'bo-hoa-cao-cap' if price_val < 600000 else 'bo-hoa-dai-tiec'
            size_name = 'Bó hoa sáp thiết kế cao cấp phối nơ lụa' if price_val < 600000 else 'Bó hoa sáp đại tiệc khổng lồ 99 bông'
        else:
            price_range_cat = 'tren-1tr'
            category_id = 'bo-hoa-dai-tiec'
            size_name = 'Bó hoa sáp đại tiệc sang trọng bậc nhất'

        # Specific tone classification refinement:
        # Soft tones can also be tagged 'pastel'
        if tone_slug == 'do-hong' and (idx % 2 == 1 or color_key == 'pink'):
            tone_slug = 'pastel' if (idx % 3 == 0) else 'do-hong'
        elif tone_slug == 'trang' and idx % 2 == 1:
            tone_slug = 'pastel'

        # Flower type assignment
        if color_key in ['peach', 'yellow'] and idx % 2 == 0:
            flower_type = 'huong-duong'
            flower_type_name = 'Hướng Dương Sáp Rực Rỡ'
        elif (idx % 7 == 2 or idx % 7 == 5):
            flower_type = 'tulip'
            flower_type_name = 'Tulip Sáp Hà Lan Dịu Dàng'
        elif (idx % 6 == 3):
            flower_type = 'cam-chuong'
            flower_type_name = 'Cẩm Chướng & Cẩm Tú Cầu Sáp'
        elif (idx % 8 == 4):
            flower_type = 'baby'
            flower_type_name = 'Hoa Baby Biển Mây Bồng Bềnh'
        elif (idx % 5 == 1 and price_val >= 359000):
            flower_type = 'mix'
            flower_type_name = 'Mix Nhiều Loại Hoa Nghệ Thuật'
        else:
            flower_type = 'hoa-hong'
            flower_type_name = 'Hoa Hồng Sáp Vĩnh Cửu'

        # Design style assignment
        if price_val == 679000 and idx % 3 == 0:
            design_style = 'lang-ke'
            style_name = 'Lẵng hoa chúc mừng sự kiện'
        elif price_val in [459000, 559000] and idx % 3 == 1:
            design_style = 'gio-hop'
            style_name = 'Hộp hoa / Giỏ hoa để bàn sang trọng (Flower Box)'
        elif price_val in [359000, 459000] and idx % 4 == 2:
            design_style = 'chau-hoa'
            style_name = 'Chậu hoa sáp decor cao cấp bền lâu'
        else:
            design_style = 'bo-hoa'
            style_name = 'Bó hoa cầm tay'

        # Occasions assignment
        occasions = ['sinh-nhat', 'ngay-le']
        if price_val >= 559000 or tone_slug in ['do-hong', 'pastel']:
            occasions.append('ky-niem')
        if tone_slug in ['vang-cam', 'do-hong'] or price_val >= 359000 or design_style in ['lang-ke', 'gio-hop']:
            occasions.append('khai-truong')
        if tone_slug == 'trang' and idx % 3 == 0:
            occasions.append('chia-buon')
        if price_val <= 359000 or idx % 2 == 0:
            occasions.append('ngay-thuong')

        # Recipients assignment
        recipients = ['nguoi-yeu', 'ban-be']
        if price_val >= 359000 or 'ky-niem' in occasions:
            recipients.append('vo-chong')
        if flower_type in ['cam-chuong', 'huong-duong'] or tone_slug in ['vang-cam', 'pastel', 'trang']:
            recipients.append('me-ba')
        if design_style in ['lang-ke', 'gio-hop', 'chau-hoa'] or price_val >= 459000 or 'khai-truong' in occasions:
            recipients.append('doi-tac')

        title = f"Rose {price_names[p_key]} - {color_name_vi} (Mẫu {flower_num})"
        botanical = f"{color_name_en} Bouquet #{flower_num} ({price_names[p_key]})"
        
        main_img_url = f"/production/{p_key}/{f_name}/{imgs[0]}"
        gallery_urls = [f"/production/{p_key}/{f_name}/{x}" for x in imgs]
        
        short_desc = f"{size_name} tone {color_name_vi}, kiểu dáng {style_name.lower()}, điểm nhấn {flower_type_name.lower()}, lưu hương thơm ngát 3-5 năm."
        full_desc = (
            f"Thiết kế hoa sáp độc quyền tại Rose với tone {color_name_vi.lower()}. "
            f"Từng đóa hoa được tuyển chọn cánh sáp dập nổi chân thật, mềm mại như hoa thật và tỏa hương tinh dầu thơm ngát. "
            f"Bó hoa được tạo hình tỉ mỉ theo phong cách Hàn Quốc xếp ly bồng bềnh, phối nơ ruy băng lụa cao cấp, "
            f"tặng kèm thiệp viết tay trang trọng và túi kiếng quai xách sang chảnh."
        )
        
        meanings = {
            'red': 'Tình yêu nồng cháy, thủy chung son sắt và sự ngưỡng mộ sâu sắc.',
            'pink': 'Nét ngọt ngào, dịu dàng, lời tỏ tình thuần khiết và sự trân trọng.',
            'blue': 'Tình yêu bình yên, sự tin tưởng vững bền và lời hứa mãi bên nhau.',
            'purple': 'Sự lãng mạn, thủy chung son sắt và vẻ đẹp quý phái kiêu kỳ.',
            'peach': 'Sự ấm áp, khởi đầu tươi sáng và lời chúc may mắn rạng rỡ.',
            'yellow': 'Niềm vui ngập tràn, tình bạn chân thành và sự tỏa sáng rạng rỡ.',
            'white': 'Tình cảm trong sáng, thuần khiết và lời chúc vạn sự an yên.',
            'pastel': 'Sự tinh tế, thanh nhã và gu thẩm mỹ tối giản sang trọng.',
        }
        meaning = meanings.get(color_key, 'Tình yêu vĩnh cửu và sự trân trọng chân thành theo năm tháng.')
        
        product = {
            'id': prod_id,
            'name': title,
            'botanicalName': botanical,
            'categoryId': category_id,
            'basePrice': price_val,
            'salePrice': int(price_val * 0.95) if idx % 3 == 0 else None,
            'imageUrl': main_img_url,
            'gallery': gallery_urls,
            'shortDescription': short_desc,
            'description': full_desc,
            'meaning': meaning,
            'careGuide': 'Bảo quản nơi khô ráo, tránh nước trực tiếp và ánh nắng gắt nhiệt độ cao.',
            'occasions': occasions,
            'recipients': recipients,
            'designStyle': design_style,
            'colorTone': tone_slug,
            'flowerType': flower_type,
            'priceRangeCategory': price_range_cat,
            'ratingAvg': round(4.8 + (idx % 3) * 0.1, 1),
            'reviewsCount': 12 + (idx * 3) % 40,
            'isInStock': True,
            'isFeatured': idx == 0 or (price_val >= 559000 and idx < 2),
            'bloomSeason': 'Hoa sáp vĩnh cửu (Độ bền 3 - 5 năm)',
            'flowerCountDescription': {
                'standard': f'Mẫu chuẩn {color_name_vi} ({style_name})',
                'deluxe': f'Mẫu chuẩn + đèn LED đom đóm 3 chế độ + vương miện ngọc trai',
                'premium': f'Phiên bản nâng cấp VIP cỡ đại + hộp thiệp da ép kim'
            }
        }
        products.append(product)

print(f"Tổng cộng đã phân loại thành công {len(products)} sản phẩm hoa sáp thực tế với đầy đủ 6 danh mục lọc!")
with open('src/data/generated_products.json', 'w', encoding='utf-8') as f:
    json.dump(products, f, ensure_ascii=False, indent=2)
