from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Order, OrderStatus
from .serializers import OrderCreateSerializer, OrderDetailSerializer
from apps.accounts.permissions import IsStaffMember

class OrderCreateView(APIView):
    """
    POST /api/orders/
    Tạo đơn hàng mới & đặt chỗ hoa (AllowAny / Auth)
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = OrderCreateSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        return Response(OrderDetailSerializer(order).data, status=status.HTTP_201_CREATED)

class OrderDetailView(APIView):
    """
    GET /api/orders/{id}/
    Tra cứu trạng thái đơn hàng thời gian thực
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        try:
            order = Order.objects.get(id=pk)
            return Response(OrderDetailSerializer(order).data)
        except Order.DoesNotExist:
            return Response({'error': 'Không tìm thấy đơn hàng'}, status=status.HTTP_404_NOT_FOUND)

class MyOrdersListView(APIView):
    """
    GET /api/orders/mine/
    Lấy danh sách đơn hàng của người dùng hiện tại
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        orders = Order.objects.filter(user=request.user).order_by('-created_at')
        return Response(OrderDetailSerializer(orders, many=True).data)

class OrderManageListView(APIView):
    """
    GET /api/orders/manage/
    Dành cho Florist & Admin theo dõi bảng Kanban tiếp nhận đơn (IsStaffMember)
    """
    permission_classes = [IsStaffMember]

    def get(self, request):
        status_filter = request.query_params.get('status')
        qs = Order.objects.all().order_by('-created_at')
        if status_filter:
            qs = qs.filter(status=status_filter)
        return Response(OrderDetailSerializer(qs, many=True).data)

class OrderStatusUpdateView(APIView):
    """
    PATCH /api/orders/{id}/status/
    Cập nhật tiến độ cắm hoa & giao hàng (IsStaffMember)
    """
    permission_classes = [IsStaffMember]

    def patch(self, request, pk):
        try:
            order = Order.objects.get(id=pk)
        except Order.DoesNotExist:
            return Response({'error': 'Không tìm thấy đơn hàng'}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get('status')
        florist_notes = request.data.get('florist_notes')

        if new_status:
            if new_status not in OrderStatus.values:
                return Response({'error': 'Trạng thái đơn không hợp lệ'}, status=status.HTTP_400_BAD_REQUEST)
            order.status = new_status

        if florist_notes is not None:
            order.florist_notes = florist_notes

        order.save()
        return Response(OrderDetailSerializer(order).data)
