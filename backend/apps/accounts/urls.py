from django.urls import path
from .views import GoogleAuthView, StaffManagementView, LoginView, RegisterView, SocialAuthView, ProfileView

urlpatterns = [
    path('login/', LoginView.as_view(), name='auth-login'),
    path('register/', RegisterView.as_view(), name='auth-register'),
    path('social/', SocialAuthView.as_view(), name='auth-social'),
    path('google/', GoogleAuthView.as_view(), name='auth-google'),
    path('profile/', ProfileView.as_view(), name='auth-profile'),
    path('staff-management/', StaffManagementView.as_view(), name='staff-management'),
]


