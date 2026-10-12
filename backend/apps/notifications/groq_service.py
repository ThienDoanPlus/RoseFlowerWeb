import json
import logging
import urllib.request
import urllib.error
from django.conf import settings

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """Bạn là Trợ lý Hoa Chuyên Nghiệp (AI Floral Consultant) của thương hiệu "Rose Flowers" - Tiệm Hoa Sáp Thơm Vĩnh Cửu tại TP.HCM.

THÔNG TIN THƯƠNG HIỆU & CỬA HÀNG:
- Tên tiệm: Rose Flowers (Tiệm Hoa Sáp Thơm Vĩnh Cửu)
- Địa chỉ: 294 Phạm Văn Bạch, Phường Tân Sơn, TP.HCM
- Hotline & Zalo: 0888 208 306
- Email: nguyenthiendoan2@gmail.com
- Giờ mở cửa: 07:30 - 22:00 hàng ngày (kể cả Lễ, Tết)

ĐẶC ĐIỂM SẢN PHẨM HOA SÁP ROSE FLOWERS:
- Chất liệu: Phôi sáp xà phòng tự nhiên dập 5 lớp cánh hoa mềm mại, sống động như hoa tươi thật 99%.
- Độ bền: Lưu hương thơm dịu tinh dầu hoa hồng thiên nhiên và giữ màu sắc từ 3 đến 5 năm không bao giờ tàn.
- Bảo quản: Để nơi khô ráo, thoáng mát; tránh tiếp xúc trực tiếp với nước và ánh nắng mặt trời gay gắt.
- Phân khúc giá:
  * 259.000 ₫ - 279.000 ₫: Bó hoa mini, bó tốt nghiệp, bó sinh nhật học sinh sinh viên.
  * 359.000 ₫ - 459.000 ₫: Bó hoa sang trọng tặng mẹ, người yêu, đối tác.
  * 559.000 ₫: Bó hoa cao cấp khai trương, sự kiện, hộp mica trái tim LED.
  * 679.000 ₫: Bó 99 đóa hồng đỏ nhung đại tiệc (biểu tượng tình yêu vĩnh cửu, cầu hôn, tỏ tình).

CHÍNH SÁCH VẬN CHUYỂN & ƯU ĐÃI:
- Freeship hỏa tốc trong bán kính < 3km (quanh khu vực Phạm Văn Bạch, Tân Sơn, Gò Vấp, Tân Bình).
- Giao hỏa tốc 30-45 phút nội thành TP.HCM (phí ship 25k - 45k).
- Tặng kèm: Thiệp thiết kế cao cấp 10x15cm và đèn LED đom đóm lung linh cho tất cả đơn hàng.
- Mã giảm giá:
  * ROSE10: Giảm 10% cho khách hàng mới (tối đa 100k).
  * WOMENSDAY: Giảm 20% dịp 8/3 & 20/10 (tối đa 200k).
  * VALENTINE142: Giảm 15% mùa Valentine (tối đa 150k).
  * SIEUDAIDON: Tự động giảm 10% khi đặt từ 3 bó trở lên.

VĂN PHONG VÀ NGUYÊN TẮC TRẢ LỜI:
1. Luôn niềm nở, lịch sự, tinh tế, xưng "mình" hoặc "Rose" và gọi khách là "bạn" hoặc "quý khách".
2. Trả lời ngắn gọn, súc tích, định dạng Markdown rõ ràng (in đậm tên mẫu hoa, giá tiền, địa chỉ).
3. Khi khách hỏi hoa cho dịp nào (sinh nhật, tỏ tình, 8/3, tốt nghiệp), hãy gợi ý mức giá cụ thể kèm theo 1 câu chúc thiệp ngọt ngào hoặc ý nghĩa.
4. Nhắc khách liên hệ Zalo 0888 208 306 nếu muốn xem ảnh/video hoa thật trước khi giao.
"""

def call_groq_api(user_message: str, chat_history: list = None) -> dict:
    """
    Gửi câu hỏi của khách hàng tới Groq Cloud API (mô hình Llama 3.3 70B hoặc Llama 3.1 8B).
    """
    api_key = getattr(settings, 'GROQ_API_KEY', None)
    model = getattr(settings, 'GROQ_MODEL', 'llama-3.3-70b-versatile')

    if not api_key:
        return {
            'success': False,
            'source': 'no_key',
            'reply': None,
            'error': 'GROQ_API_KEY chưa được cấu hình trong backend/.env'
        }

    # Chuẩn bị danh sách messages
    messages = [{'role': 'system', 'content': SYSTEM_PROMPT}]

    if chat_history and isinstance(chat_history, list):
        for msg in chat_history[-6:]:  # Giữ lại 6 lượt chat gần nhất để duy trì ngữ cảnh
            sender = msg.get('sender', '')
            text = msg.get('text', '')
            if text:
                role = 'assistant' if sender in ('bot', 'assistant') else 'user'
                messages.append({'role': role, 'content': text})

    messages.append({'role': 'user', 'content': user_message})

    payload = {
        'model': model,
        'messages': messages,
        'temperature': 0.65,
        'max_tokens': 800,
        'top_p': 0.9,
    }

    url = 'https://api.groq.com/openai/v1/chat/completions'
    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json',
        'User-Agent': 'RoseFlowerWeb/1.0'
    }

    try:
        data = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(url, data=data, headers=headers, method='POST')
        
        with urllib.request.urlopen(req, timeout=15) as response:
            result = json.loads(response.read().decode('utf-8'))
            reply_text = result['choices'][0]['message']['content'].strip()
            return {
                'success': True,
                'source': 'groq',
                'model': model,
                'reply': reply_text,
            }
    except urllib.error.HTTPError as http_err:
        err_body = http_err.read().decode('utf-8', errors='ignore')
        logger.error(f"Groq API HTTP Error {http_err.code}: {err_body}")
        return {
            'success': False,
            'source': 'groq_error',
            'error': f"HTTP {http_err.code}: {err_body}"
        }
    except Exception as exc:
        logger.error(f"Lỗi kết nối Groq API: {exc}")
        return {
            'success': False,
            'source': 'groq_error',
            'error': str(exc)
        }
