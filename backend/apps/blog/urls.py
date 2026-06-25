from rest_framework.routers import DefaultRouter
from .views import BlogPostViewSet, BlogFAQViewSet

router = DefaultRouter()
router.register(r'faqs', BlogFAQViewSet, basename='blog-faq')
router.register('', BlogPostViewSet, basename='blog')

urlpatterns = router.urls
