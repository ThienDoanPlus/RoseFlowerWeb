from rest_framework import serializers
from .models import User, Role

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'email', 'role', 'full_name', 'phone_number',
            'avatar_url', 'saved_address', 'district', 'city',
            'date_joined', 'is_active'
        ]
        read_only_fields = ['id', 'date_joined']

class GoogleAuthSerializer(serializers.Serializer):
    email = serializers.EmailField()
    name = serializers.CharField(required=False, default='')
    role = serializers.ChoiceField(choices=Role.choices, required=False, default=Role.CUSTOMER)
    avatar_url = serializers.CharField(required=False, default='')
