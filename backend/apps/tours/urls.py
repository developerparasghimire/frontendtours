from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TourViewSet, TourGuideViewSet, TourGuideLanguageViewSet

router = DefaultRouter()
router.register(r'guides', TourGuideViewSet, basename='tour-guide')
router.register(r'guide-languages', TourGuideLanguageViewSet, basename='tour-guide-language')
router.register(r'', TourViewSet, basename='tour')

urlpatterns = [
    path('', include(router.urls)),
]
