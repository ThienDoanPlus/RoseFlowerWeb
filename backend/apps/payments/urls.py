from django.urls import path
from .views import CreatePaymentIntentView, VerifyWebhookView, AdminApprovePaymentView

urlpatterns = [
    path('create-intent/', CreatePaymentIntentView.as_view(), name='payment-create-intent'),
    path('verify-webhook/', VerifyWebhookView.as_view(), name='payment-verify-webhook'),
    path('admin-approve/', AdminApprovePaymentView.as_view(), name='payment-admin-approve'),
]
