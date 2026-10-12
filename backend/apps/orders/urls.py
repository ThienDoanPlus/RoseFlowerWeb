from django.urls import path
from .views import (
    OrderCreateView,
    OrderDetailView,
    MyOrdersListView,
    OrderManageListView,
    OrderStatusUpdateView,
)

urlpatterns = [
    path('', OrderCreateView.as_view(), name='order-create'),
    path('mine/', MyOrdersListView.as_view(), name='order-mine'),
    path('manage/', OrderManageListView.as_view(), name='order-manage'),
    path('<str:pk>/', OrderDetailView.as_view(), name='order-detail'),
    path('<str:pk>/status/', OrderStatusUpdateView.as_view(), name='order-status-update'),
]
