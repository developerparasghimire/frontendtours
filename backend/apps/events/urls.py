from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EventViewSet, EventFAQViewSet, event_pdf_lead_view

router = DefaultRouter()
router.register(r'faqs', EventFAQViewSet, basename='event-faq')
router.register(r'', EventViewSet, basename='event')

urlpatterns = [
    path('pdf-lead/', event_pdf_lead_view, name='event-pdf-lead'),
    path('', include(router.urls)),
]
