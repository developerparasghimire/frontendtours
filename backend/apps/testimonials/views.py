from rest_framework import viewsets, permissions
from .models import Testimonial
from .serializers import TestimonialSerializer
from apps.common.permissions import IsAdminOrStaff


class TestimonialViewSet(viewsets.ModelViewSet):
    serializer_class = TestimonialSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and user.role in ['SUPER_ADMIN', 'ADMIN', 'STAFF']:
            return Testimonial.objects.all()
        return Testimonial.objects.filter(is_active=True)

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [IsAdminOrStaff()]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
