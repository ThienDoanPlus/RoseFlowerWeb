# pyrefly: ignore [missing-import]
from rest_framework.routers import DefaultRouter
from .views import FlowerViewSet

router = DefaultRouter()
router.register(r'', FlowerViewSet, basename='flower')

urlpatterns = router.urls
