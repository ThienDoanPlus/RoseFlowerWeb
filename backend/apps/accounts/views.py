from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import User, Role
from .serializers import UserSerializer, GoogleAuthSerializer
from .permissions import IsAdminUser

class GoogleAuthView(APIView):
    """
    POST /api/auth/google/
    Đăng nhập / Đăng ký nhanh với Gmail/Google OAuth
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = GoogleAuthSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        name = serializer.validated_data.get('name', '')
        avatar_url = serializer.validated_data.get('avatar_url', '')
        role = serializer.validated_data.get('role', Role.CUSTOMER)

        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'username': email,
                'full_name': name or email.split('@')[0],
                'avatar_url': avatar_url,
                'role': role,
            }
        )

        return Response({
            'message': 'Đăng nhập Google thành công' if not created else 'Đã tạo tài khoản mới',
            'user': UserSerializer(user).data,
            'role': user.role,
        }, status=status.HTTP_200_OK if not created else status.HTTP_201_CREATED)

class LoginView(APIView):
    """
    POST /api/auth/login/
    Đăng nhập bằng Email & Mật khẩu
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip()
        password = request.data.get('password', '')

        if not email:
            return Response({'error': 'Vui lòng cung cấp email'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'Tài khoản không tồn tại trong hệ thống'}, status=status.HTTP_404_NOT_FOUND)

        if password and not user.check_password(password):
            return Response({'error': 'Mật khẩu không chính xác'}, status=status.HTTP_401_UNAUTHORIZED)

        return Response({
            'message': f'Đăng nhập thành công với vai trò {user.get_role_display()}!',
            'user': UserSerializer(user).data,
            'role': user.role,
        }, status=status.HTTP_200_OK)

class RegisterView(APIView):
    """
    POST /api/auth/register/
    Đăng ký tài khoản mới cho Khách hàng
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        from .serializers import RegisterSerializer
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email'].strip().lower()
        password = serializer.validated_data['password']
        full_name = serializer.validated_data.get('full_name', '').strip()
        phone_number = serializer.validated_data.get('phone_number', '').strip()

        if User.objects.filter(email=email).exists():
            return Response({'error': 'Email này đã được sử dụng. Vui lòng đăng nhập hoặc chọn email khác.'}, status=status.HTTP_400_BAD_REQUEST)

        user = User(
            email=email,
            username=email,
            full_name=full_name or email.split('@')[0],
            phone_number=phone_number,
            role=Role.CUSTOMER,
            is_active=True,
        )
        user.set_password(password)
        user.save()

        return Response({
            'message': 'Đăng ký tài khoản thành công! Chào mừng bạn đến với Rose Flowers.',
            'user': UserSerializer(user).data,
            'role': user.role,
        }, status=status.HTTP_201_CREATED)

class SocialAuthView(APIView):
    """
    POST /api/auth/social/
    Liên kết đăng nhập / tạo tài khoản nhanh qua Google (Gmail) hoặc Facebook
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        from .serializers import SocialAuthSerializer
        serializer = SocialAuthSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        provider = serializer.validated_data.get('provider', 'google')
        email = serializer.validated_data['email'].strip().lower()
        name = serializer.validated_data.get('name', '').strip()
        avatar_url = serializer.validated_data.get('avatar_url', '').strip()

        user = User.objects.filter(email=email).first()
        created = False
        if not user:
            created = True
            user = User(
                email=email,
                username=email,
                full_name=name or email.split('@')[0],
                avatar_url=avatar_url or (
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
                    if provider == 'google' else
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
                ),
                role=Role.CUSTOMER,
                is_active=True,
            )
            user.set_unusable_password()
            user.save()
        else:
            if name and not user.full_name:
                user.full_name = name
                user.save(update_fields=['full_name'])

        provider_name = 'Google (Gmail)' if provider == 'google' else 'Facebook'
        msg = f'Đăng ký và liên kết tài khoản {provider_name} thành công!' if created else f'Đăng nhập qua {provider_name} thành công!'

        return Response({
            'message': msg,
            'user': UserSerializer(user).data,
            'role': user.role,
        }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class StaffManagementView(APIView):
    """
    GET, POST, PUT /api/auth/staff-management/
    Quản lý tài khoản và phân quyền (Chỉ dành cho ADMIN)
    """
    permission_classes = [IsAdminUser]

    def get(self, request):
        users = User.objects.all().order_by('-date_joined')
        return Response(UserSerializer(users, many=True).data)

    def put(self, request):
        user_id = request.data.get('user_id')
        new_role = request.data.get('role')
        if not user_id or new_role not in Role.values:
            return Response({'error': 'Tham số user_id hoặc role không hợp lệ'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            target_user = User.objects.get(id=user_id)
            target_user.role = new_role
            target_user.save()
            return Response(UserSerializer(target_user).data)
        except User.DoesNotExist:
            return Response({'error': 'Không tìm thấy người dùng'}, status=status.HTTP_404_NOT_FOUND)


class ProfileView(APIView):
    """
    PUT /api/auth/profile/
    Cập nhật thông tin cá nhân và mật khẩu
    """
    permission_classes = [permissions.AllowAny]

    def put(self, request):
        from .serializers import ProfileUpdateSerializer
        serializer = ProfileUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data.get('email', '').strip().lower()
        user_id = request.data.get('user_id')

        user = None
        if request.user.is_authenticated:
            user = request.user
        elif email:
            user = User.objects.filter(email=email).first()
        elif user_id:
            user = User.objects.filter(id=user_id).first()

        if not user:
            return Response({'error': 'Không tìm thấy tài khoản người dùng.'}, status=status.HTTP_404_NOT_FOUND)

        data = serializer.validated_data

        # Xử lý đổi mật khẩu
        new_password = data.get('new_password')
        if new_password:
            current_password = data.get('current_password')
            if user.has_usable_password():
                if not current_password or not user.check_password(current_password):
                    return Response({'error': 'Mật khẩu hiện tại không chính xác.'}, status=status.HTTP_400_BAD_REQUEST)
            user.set_password(new_password)

        if data.get('full_name'):
            user.full_name = data['full_name'].strip()
        if 'phone_number' in data:
            user.phone_number = data['phone_number'].strip()
        if data.get('avatar_url'):
            user.avatar_url = data['avatar_url'].strip()
        if 'saved_address' in data:
            user.saved_address = data['saved_address'].strip()
        if 'district' in data:
            user.district = data['district'].strip()
        if 'city' in data:
            user.city = data['city'].strip()

        user.save()

        return Response({
            'message': 'Cập nhật thông tin tài khoản thành công!',
            'user': UserSerializer(user).data
        }, status=status.HTTP_200_OK)


class AvatarUploadView(APIView):
    """
    POST /api/auth/upload-avatar/
    Tải file ảnh đại diện trực tiếp lên Cloud Storage (Cloudinary) và trả về URL ảnh online (HTTPS).
    Không lưu dữ liệu ảnh ở local.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        file = request.FILES.get('avatar_file') or request.FILES.get('file')
        user_id = request.data.get('user_id')
        email = request.data.get('email')

        if not file:
            base64_data = request.data.get('avatar_base64')
            if base64_data:
                file = base64_data

        if not file:
            return Response({'error': 'Vui lòng chọn file ảnh để tải lên.'}, status=status.HTTP_400_BAD_REQUEST)

        from django.conf import settings
        from django.utils import timezone
        from apps.catalog.cloudinary_service import upload_image_to_cloudinary, is_cloudinary_configured

        if not is_cloudinary_configured():
            return Response({
                'error': 'Dịch vụ lưu trữ đám mây Cloudinary chưa được cấu hình trên máy chủ.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        try:
            folder_name = f"{getattr(settings, 'CLOUDINARY_FOLDER', 'RoseFlowerWeb')}/avatars"
            clean_id = (user_id or email or 'guest').replace('@', '_').replace('.', '_')
            public_id = f"avatar_{clean_id}_{int(timezone.now().timestamp())}"

            result = upload_image_to_cloudinary(
                file,
                folder=folder_name,
                public_id=public_id,
                tags=['avatar', 'user_profile']
            )

            avatar_url = result.get('url')

            # Tự động cập nhật trực tiếp vào tài khoản người dùng trong cơ sở dữ liệu
            if user_id or email:
                user = None
                if user_id:
                    user = User.objects.filter(id=user_id).first()
                if not user and email:
                    user = User.objects.filter(email=email).first()
                if user:
                    user.avatar_url = avatar_url
                    user.save(update_fields=['avatar_url'])

            return Response({
                'success': True,
                'avatar_url': avatar_url,
                'message': 'Đã tải ảnh đại diện lên máy chủ Cloudinary thành công!'
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'error': f'Không thể tải ảnh lên đám mây: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

