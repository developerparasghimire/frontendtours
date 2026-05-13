from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import TestimonialViewSet

router = DefaultRouter()
router.register(r'', TestimonialViewSet, basename='testimonial')

urlpatterns = [
    path('', include(router.urls)),
]
