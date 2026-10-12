import os
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

def is_cloudinary_configured() -> bool:
    """Kiểm tra xem hệ thống đã điền đủ thông tin Cloudinary hay chưa."""
    return bool(
        getattr(settings, 'CLOUDINARY_CLOUD_NAME', None) and
        getattr(settings, 'CLOUDINARY_API_KEY', None) and
        getattr(settings, 'CLOUDINARY_API_SECRET', None)
    )

def upload_image_to_cloudinary(
    file_or_path,
    folder: str = None,
    public_id: str = None,
    tags: list = None
) -> dict:
    """
    Tải một hình ảnh lên Cloudinary và lưu vào thư mục chỉ định (mặc định: roseflowerweb).

    :param file_or_path: Đường dẫn file cục bộ hoặc đối tượng File (Django UploadedFile / binary buffer)
    :param folder: Tên thư mục trên Cloudinary (mặc định lấy từ settings.CLOUDINARY_FOLDER = 'roseflowerweb')
    :param public_id: Tên file tùy chỉnh (không bắt buộc)
    :param tags: Danh sách nhãn phân loại (vd: ['rose', '559k'])
    :return: dict kết quả trả về từ Cloudinary chứa secure_url, public_id, width, height, format...
    """
    if not is_cloudinary_configured():
        raise ValueError(
            "Cloudinary chưa được cấu hình. Vui lòng kiểm tra CLOUDINARY_CLOUD_NAME, "
            "CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET trong backend/.env hoặc Render Environment Variables."
        )

    import cloudinary.uploader

    # Sử dụng folder được truyền vào hoặc folder mặc định từ settings ('roseflowerweb')
    target_folder = folder or getattr(settings, 'CLOUDINARY_FOLDER', 'roseflowerweb')

    upload_options = {
        'folder': target_folder,
        'resource_type': 'image',
        'use_filename': True,
        'unique_filename': True,
        'overwrite': False,
    }

    if public_id:
        upload_options['public_id'] = public_id

    if tags:
        upload_options['tags'] = tags

    try:
        response = cloudinary.uploader.upload(file_or_path, **upload_options)
        return {
            'success': True,
            'url': response.get('secure_url'),
            'public_id': response.get('public_id'),
            'format': response.get('format'),
            'width': response.get('width'),
            'height': response.get('height'),
            'bytes': response.get('bytes'),
        }
    except Exception as exc:
        logger.error(f"Lỗi tải ảnh lên Cloudinary folder '{target_folder}': {exc}")
        return {
            'success': False,
            'error': str(exc)
        }
