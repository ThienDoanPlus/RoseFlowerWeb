from django.urls import path
from .ai_views import AIConsultationView

urlpatterns = [
    path('ai-consult/', AIConsultationView.as_view(), name='ai-consult'),
]
