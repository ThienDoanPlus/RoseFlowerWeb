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
