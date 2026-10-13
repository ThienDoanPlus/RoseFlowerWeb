import re
from rest_framework import serializers
from .models import User, Role

def validate_password_strength(password: str):
    """
    Quy tắc mật khẩu chuẩn:
    - Độ dài tối thiểu: Ít nhất từ 8 đến 12 ký tự trở lên (tối thiểu 8 ký tự).
    - Có sự kết hợp của cả 4 nhóm ký tự:
      1. Chữ in hoa (A-Z)
      2. Chữ thường (a-z)
      3. Chữ số (0-9)
      4. Ký tự đặc biệt (!@#$%^&*...)
    """
    if len(password) < 8:
        raise serializers.ValidationError("Mật khẩu phải có độ dài tối thiểu từ 8 ký tự trở lên.")
    if not re.search(r'[A-Z]', password):
        raise serializers.ValidationError("Mật khẩu phải chứa ít nhất 1 chữ in hoa (A-Z).")
    if not re.search(r'[a-z]', password):
        raise serializers.ValidationError("Mật khẩu phải chứa ít nhất 1 chữ thường (a-z).")
    if not re.search(r'[0-9]', password):
        raise serializers.ValidationError("Mật khẩu phải chứa ít nhất 1 chữ số (0-9).")
    if not re.search(r'[^A-Za-z0-9]', password):
        raise serializers.ValidationError("Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (!@#$%^&*...).")
    return password

def validate_phone_number(phone: str):
    """
    Số điện thoại phải bao gồm đúng 10 chữ số (theo chuẩn số điện thoại Việt Nam).
    """
    clean_phone = re.sub(r'[\s\-\.]', '', phone.strip()) if phone else ''
    if clean_phone and not re.match(r'^\d{10}$', clean_phone):
        raise serializers.ValidationError("Số điện thoại phải bao gồm đúng 10 chữ số.")
    return clean_phone

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

class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, validators=[validate_password_strength])
    full_name = serializers.CharField(required=True)
    phone_number = serializers.CharField(required=True, validators=[validate_phone_number])

class SocialAuthSerializer(serializers.Serializer):
    provider = serializers.ChoiceField(choices=['google', 'facebook'], default='google')
    email = serializers.EmailField()
    name = serializers.CharField(required=False, default='')
    avatar_url = serializers.CharField(required=False, default='')

class ProfileUpdateSerializer(serializers.Serializer):
    email = serializers.EmailField(required=False)
    full_name = serializers.CharField(required=False, allow_blank=True)
    phone_number = serializers.CharField(required=False, allow_blank=True, validators=[validate_phone_number])
    avatar_url = serializers.CharField(required=False, allow_blank=True)
    saved_address = serializers.CharField(required=False, allow_blank=True)
    district = serializers.CharField(required=False, allow_blank=True)
    city = serializers.CharField(required=False, allow_blank=True)
    current_password = serializers.CharField(required=False, allow_blank=True, write_only=True)
    new_password = serializers.CharField(required=False, allow_blank=True, write_only=True, validators=[validate_password_strength])
