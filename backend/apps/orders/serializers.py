from rest_framework import serializers
from .models import Order, OrderItem
from apps.catalog.models import Flower

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['id', 'flower', 'flower_name', 'size_variant', 'unit_price', 'quantity', 'total_price']

class OrderDetailSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    assigned_staff_name = serializers.CharField(source='assigned_staff.full_name', read_only=True)

    class Meta:
        model = Order
        fields = '__all__'

class OrderCreateSerializer(serializers.ModelSerializer):
    items_data = serializers.ListField(child=serializers.DictField(), write_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'customer_name', 'customer_phone', 'customer_email',
            'shipping_address', 'delivery_district', 'delivery_city',
            'branch_origin_id', 'distance_km', 'shipping_fee', 'subtotal',
            'discount_amount', 'total_amount', 'voucher_code', 'greeting_message',
            'sender_signature', 'delivery_date', 'delivery_time_slot', 'items_data'
        ]

    def create(self, validated_data):
        items_data = validated_data.pop('items_data')
        request = self.context.get('request')
        user = request.user if request and request.user.is_authenticated else None

        order = Order.objects.create(user=user, **validated_data)

        for item in items_data:
            flower_id = item.get('flower_id')
            flower = Flower.objects.get(id=flower_id)
            OrderItem.objects.create(
                order=order,
                flower=flower,
                flower_name=item.get('flower_name', flower.name),
                size_variant=item.get('size_variant', 'STANDARD'),
                unit_price=item.get('unit_price', flower.base_price),
                quantity=item.get('quantity', 1),
                total_price=item.get('total_price', flower.base_price * item.get('quantity', 1)),
            )

        return order
