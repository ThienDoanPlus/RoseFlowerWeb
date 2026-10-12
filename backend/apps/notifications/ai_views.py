from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from .groq_service import call_groq_api

class AIConsultationView(APIView):
    """
    Endpoint tư vấn hoa sáp thông minh sử dụng Groq Llama 3.3 70B
    POST /api/chat/ai-consult/
    Body:
    {
        "message": "Gợi ý cho mình mẫu hoa tặng sinh nhật người yêu khoảng 300k",
        "history": [
            {"sender": "user", "text": "..."},
            {"sender": "bot", "text": "..."}
        ]
    }
    """
    permission_classes = [AllowAny]

    def post(self, request):
        user_message = request.data.get('message', '').strip()
        history = request.data.get('history', [])

        if not user_message:
            return Response(
                {'error': 'Nội dung tin nhắn không được để trống.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Gọi dịch vụ Groq AI
        result = call_groq_api(user_message, history)

        if result.get('success'):
            return Response({
                'reply': result['reply'],
                'model': result.get('model'),
                'source': 'groq'
            }, status=status.HTTP_200_OK)

        # Nếu chưa cấu hình GROQ_API_KEY hoặc Groq lỗi, fallback thông minh
        fallback_reply = (
            "Dạ chào bạn! Tiệm hoa sáp thơm Rose Flowers tại 294 Phạm Văn Bạch, Tân Sơn, TP.HCM xin lắng nghe bạn ạ. "
            "Hiện tại tiệm có đầy đủ các mẫu hoa sáp vĩnh cửu từ 259.000 ₫ - 679.000 ₫ (lưu hương thơm 3-5 năm, tặng kèm thiệp thiết kế & đèn LED). "
            "Bạn có thể nhắn trực tiếp Zalo **0888 208 306** để được thợ hoa gửi ảnh thực tế và ship hỏa tốc nhé!"
        )

        return Response({
            'reply': fallback_reply,
            'source': 'fallback',
            'note': result.get('error')
        }, status=status.HTTP_200_OK)
