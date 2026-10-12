from django.urls import path
from .views import GoogleAuthView, StaffManagementView

urlpatterns = [
    path('google/', GoogleAuthView.as_view(), name='auth-google'),
    path('staff-management/', StaffManagementView.as_view(), name='staff-management'),
]
