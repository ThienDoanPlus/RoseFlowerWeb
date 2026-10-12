#!/usr/bin/env python3
"""
Rose Flowers - Script đồng bộ toàn bộ ảnh hoa lên Cloudinary (Thư mục: roseflowerweb)
==================================================================================
Cách dùng:
  python backend/upload_to_cloudinary.py

Script sẽ:
1. Đọc cấu hình Cloudinary từ backend/.env (hoặc biến môi trường).
2. Quét toàn bộ hình ảnh hoa trong thư mục public/production/.
3. Tải lên Cloudinary vào thư mục con: roseflowerweb/...
4. Cập nhật trực tiếp đường dẫn ảnh (secure_url) vào database TiDB Cloud / SQLite.
"""

import os
import sys
from pathlib import Path

# Cấu hình môi trường Django
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
django.setup()

from django.conf import settings
from apps.catalog.models import Flower
from apps.catalog.cloudinary_service import is_cloudinary_configured, upload_image_to_cloudinary

def sync_images_to_cloudinary():
    print("=" * 65)
    print("  ROSE FLOWERS - ĐỒNG BỘ ẢNH HOA LÊN CLOUDINARY")
    print(f"  Thư mục đích trên Cloudinary: '{settings.CLOUDINARY_FOLDER}'")
    print("=" * 65)

    if not is_cloudinary_configured():
        print("\n LỖI: Chưa tìm thấy cấu hình Cloudinary!")
        print("Vui lòng mở file backend/.env và điền:")
        print("  CLOUDINARY_CLOUD_NAME=\"tên-cloud-của-bạn\"")
        print("  CLOUDINARY_API_KEY=\"api-key\"")
        print("  CLOUDINARY_API_SECRET=\"api-secret\"")
        print(f"  CLOUDINARY_FOLDER=\"{settings.CLOUDINARY_FOLDER}\"")
        sys.exit(1)

    print(f" Đã kết nối Cloudinary: Cloud Name = {settings.CLOUDINARY_CLOUD_NAME}")
    
    root_dir = BASE_DIR.parent
    public_production_dir = root_dir / "public" / "production"
    
    if not public_production_dir.exists():
        print(f" Không tìm thấy thư mục: {public_production_dir}")
        sys.exit(1)

    flowers = Flower.objects.all()
    total_flowers = flowers.count()
    print(f"Tìm thấy {total_flowers} sản phẩm hoa trong database.")
    print(f"Bắt đầu quá trình tải ảnh lên folder '{settings.CLOUDINARY_FOLDER}'...\n")

    uploaded_count = 0
    skipped_count = 0
    error_count = 0

    for idx, flower in enumerate(flowers, start=1):
        # Kiểm tra xem ảnh đại diện đã là link Cloudinary chưa
        if flower.image_url and flower.image_url.startswith("https://res.cloudinary.com"):
            print(f"[{idx}/{total_flowers}] ⏩ {flower.name[:35]}: Đã có ảnh trên Cloudinary.")
            skipped_count += 1
            continue

        # Tìm file ảnh cục bộ
        # image_url thường có dạng: "/production/559k/flower1/xxx.jpg"
        clean_rel_path = flower.image_url.lstrip("/")
        local_file_path = root_dir / "public" / clean_rel_path

        if not local_file_path.exists():
            print(f"[{idx}/{total_flowers}]  Không tìm thấy file cục bộ: {local_file_path.name}")
            skipped_count += 1
            continue

        print(f"[{idx}/{total_flowers}] ⬆️ Đang tải {flower.name[:30]} ({local_file_path.name})...")
        # Phân loại theo thư mục con trong folder chính: roseflowerweb/<nhóm_giá>/<mã_hoa>
        sub_folder = f"{settings.CLOUDINARY_FOLDER}/{flower.price_range_category}"
        
        result = upload_image_to_cloudinary(
            file_or_path=str(local_file_path),
            folder=sub_folder,
            tags=['rose_flower', flower.price_range_category]
        )

        if result.get('success'):
            old_url = flower.image_url
            flower.image_url = result['url']
            flower.save(update_fields=['image_url'])
            uploaded_count += 1
            print(f"     Thành công: {result['url']}")
        else:
            print(f"     Thất bại: {result.get('error')}")
            error_count += 1

    print("\n" + "=" * 65)
    print("  KẾT QUẢ ĐỒNG BỘ CLOUDINARY:")
    print(f"  - Tải lên thành công: {uploaded_count} ảnh")
    print(f"  - Bỏ qua (đã có):    {skipped_count} ảnh")
    print(f"  - Lỗi:                {error_count} ảnh")
    print(f"  - Thư mục lưu trữ:    Cloudinary / {settings.CLOUDINARY_FOLDER}")
    print("=" * 65)

if __name__ == '__main__':
    sync_images_to_cloudinary()
