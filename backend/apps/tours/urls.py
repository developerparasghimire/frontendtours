from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TourViewSet, TourGuideViewSet, TourGuideLanguageViewSet, TourFAQViewSet, tour_pdf_lead_view

router = DefaultRouter()
router.register(r'guides', TourGuideViewSet, basename='tour-guide')
router.register(r'guide-languages', TourGuideLanguageViewSet, basename='tour-guide-language')
router.register(r'faqs', TourFAQViewSet, basename='tour-faq')
router.register(r'', TourViewSet, basename='tour')

urlpatterns = [
    path('pdf-lead/', tour_pdf_lead_view, name='tour-pdf-lead'),
    path('', include(router.urls)),
]
