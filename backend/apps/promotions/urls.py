from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import VoucherViewSet, ValidateVoucherView

router = DefaultRouter()
router.register(r'', VoucherViewSet, basename='voucher')

urlpatterns = [
    path('validate/', ValidateVoucherView.as_view(), name='voucher-validate'),
] + router.urls
