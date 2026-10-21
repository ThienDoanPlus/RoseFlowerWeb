"""
URL configuration for Rose Flowers project.
"""

from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def health_check(request):
    return JsonResponse({'status': 'ok', 'service': 'rose-flower-backend'})

urlpatterns = [
    path('', health_check, name='root-health'),
    path('health/', health_check, name='health-check'),
    path('api/health/', health_check, name='api-health-check'),
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.accounts.urls')),
    path('api/accounts/', include('apps.accounts.urls')),
    path('api/flowers/', include('apps.catalog.urls')),
    path('api/catalog/flowers/', include('apps.catalog.urls')),
    path('api/categories/', include('apps.catalog.category_urls')),
    path('api/catalog/categories/', include('apps.catalog.category_urls')),
    path('api/vouchers/', include('apps.promotions.urls')),
    path('api/orders/', include('apps.orders.urls')),
    path('api/payments/', include('apps.payments.urls')),
    path('api/reviews/', include('apps.reviews.urls')),
    path('api/chat/', include('apps.notifications.ai_urls')),
]
