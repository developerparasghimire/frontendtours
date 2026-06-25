from rest_framework import viewsets, permissions, filters
from .models import BlogPost, BlogFAQ
from .serializers import BlogPostSerializer, BlogFAQSerializer
from apps.common.permissions import IsAdminOrStaff


class BlogPostViewSet(viewsets.ModelViewSet):
    serializer_class = BlogPostSerializer
    lookup_field = 'slug'
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'excerpt', 'category', 'tags', 'author']
    ordering_fields = ['created_at', 'publish_date']

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and user.role in ['SUPER_ADMIN', 'ADMIN', 'STAFF']:
            return BlogPost.objects.all()
        return BlogPost.objects.filter(is_published=True)

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [IsAdminOrStaff()]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class BlogFAQViewSet(viewsets.ModelViewSet):
    serializer_class = BlogFAQSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [IsAdminOrStaff()]

    def get_queryset(self):
        qs = BlogFAQ.objects.all()
        post_slug = self.request.query_params.get('post_slug')
        if post_slug:
            qs = qs.filter(post__slug=post_slug)
        return qs
