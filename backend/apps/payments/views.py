from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.utils import timezone
from .models import Transaction, PaymentMethod, PaymentStatus
from .serializers import PaymentIntentSerializer, PaymentWebhookSerializer
from .gateways.vietqr import generate_vietqr_url
from .gateways.momo import generate_momo_intent
from .gateways.vnpay import generate_vnpay_intent
from .gateways.zalopay import generate_zalopay_intent
from apps.orders.models import Order

class CreatePaymentIntentView(APIView):
    """
    POST /api/payments/create-intent/
    Khởi tạo ý định thanh toán trực tuyến bảo mật
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PaymentIntentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        order_id = serializer.validated_data['order_id']
        method = serializer.validated_data['method']

        try:
            order = Order.objects.get(id=order_id)
        except Order.DoesNotExist:
            return Response({'error': 'Không tìm thấy đơn hàng'}, status=status.HTTP_404_NOT_FOUND)

        if method == PaymentMethod.VIETQR:
            payload = generate_vietqr_url(order.total_amount, order.id)
        elif method == PaymentMethod.MOMO:
            payload = generate_momo_intent(order.id, order.total_amount)
        elif method == PaymentMethod.VNPAY:
            payload = generate_vnpay_intent(order.id, order.total_amount)
        elif method == PaymentMethod.ZALOPAY:
            payload = generate_zalopay_intent(order.id, order.total_amount)
        else:
            payload = {'method': 'COD', 'message': 'Thanh toán trực tiếp khi nhận hoa'}

        # Create or update transaction
        txn_id = f"TXN-{order.id}-{method}"
        Transaction.objects.update_or_create(
            id=txn_id,
            defaults={
                'order': order,
                'method': method,
                'amount': order.total_amount,
                'status': PaymentStatus.PENDING,
                'transaction_code': f"REF-{order.id}",
                'payment_gateway_payload': payload,
            }
        )

        return Response({
            'order_id': order.id,
            'method': method,
            'amount': str(order.total_amount),
            'payload': payload,
        })

class VerifyWebhookView(APIView):
    """
    POST /api/payments/verify-webhook/
    Webhook xác thực giao dịch thành công từ ngân hàng/cổng ví
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PaymentWebhookSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        order_id = serializer.validated_data['order_id']
        txn_code = serializer.validated_data['transaction_code']
        pay_status = serializer.validated_data['status']

        try:
            order = Order.objects.get(id=order_id)
            if pay_status.upper() == 'SUCCESS':
                Transaction.objects.filter(order=order).update(
                    status=PaymentStatus.SUCCESS,
                    transaction_code=txn_code,
                    paid_at=timezone.now()
                )
            return Response({'status': 'ok', 'order_id': order_id})
        except Order.DoesNotExist:
            return Response({'error': 'Không tìm thấy đơn hàng'}, status=status.HTTP_404_NOT_FOUND)
