from rest_framework import serializers
from .models import Voucher

class VoucherListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Voucher
        fields = '__all__'

class VoucherValidationSerializer(serializers.Serializer):
    code = serializers.CharField(max_length=50)
    subtotal = serializers.DecimalField(max_digits=12, decimal_places=2)
    quantity = serializers.IntegerField(default=1)
