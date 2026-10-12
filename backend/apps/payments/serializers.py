# pyrefly: ignore [missing-import]
from rest_framework import serializers
from .models import Transaction, PaymentMethod

class PaymentIntentSerializer(serializers.Serializer):
    order_id = serializers.CharField(max_length=50)
    method = serializers.ChoiceField(choices=PaymentMethod.choices)

class PaymentWebhookSerializer(serializers.Serializer):
    order_id = serializers.CharField(max_length=50)
    transaction_code = serializers.CharField(max_length=100)
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    status = serializers.CharField(max_length=20)
