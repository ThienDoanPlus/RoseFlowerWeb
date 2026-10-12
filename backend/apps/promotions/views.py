from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Voucher
from .serializers import VoucherListSerializer, VoucherValidationSerializer
from .services import validate_voucher_logic, calculate_bulk_discount
from apps.accounts.permissions import IsAdminUser

class VoucherViewSet(viewsets.ModelViewSet):
    """
    API Danh sách voucher:
    - GET: AllowAny
    - POST, PUT, DELETE: IsAdminUser
    """
    queryset = Voucher.objects.all()
    serializer_class = VoucherListSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [IsAdminUser()]

class ValidateVoucherView(APIView):
    """
    POST /api/vouchers/validate/
    Kiểm tra tính hợp lệ và tính số tiền giảm giá
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = VoucherValidationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        code = serializer.validated_data['code'].upper().strip()
        subtotal = serializer.validated_data['subtotal']
        quantity = serializer.validated_data['quantity']

        # Bulk discount check
        bulk_info = calculate_bulk_discount(quantity, subtotal)

        try:
            voucher = Voucher.objects.get(code=code)
            res = validate_voucher_logic(voucher, subtotal, quantity)
            return Response({
                **res,
                'voucher': VoucherListSerializer(voucher).data,
                'bulk_discount': bulk_info,
            })
        except Voucher.DoesNotExist:
            return Response({
                'is_valid': False,
                'discount_amount': '0',
                'message': f"Mã giảm giá '{code}' không tồn tại hoặc đã hết hạn",
                'bulk_discount': bulk_info,
            }, status=status.HTTP_400_BAD_REQUEST)
