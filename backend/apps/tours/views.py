from django.db.models import Count
from django.db.models.deletion import ProtectedError
from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Tour, TourGuide, TourGuideLanguage, TourPDFLead, TourFAQ
from .serializers import TourSerializer, TourGuideSerializer, TourGuideLanguageSerializer, TourFAQSerializer
from apps.common.permissions import IsAdminOrStaff


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def tour_pdf_lead_view(request):
    email = request.data.get('email', '').strip()
    tour_id = request.data.get('tour_id')

    if not email or '@' not in email or '.' not in email.split('@')[-1]:
        return Response({'error': 'Valid email address required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        tour = Tour.objects.get(pk=tour_id)
    except (Tour.DoesNotExist, TypeError, ValueError):
        return Response({'error': 'Tour not found.'}, status=status.HTTP_404_NOT_FOUND)

    TourPDFLead.objects.get_or_create(email=email, tour=tour)
    return Response({'success': True})

class TourViewSet(viewsets.ModelViewSet):
    serializer_class = TourSerializer
    lookup_field = 'slug'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['destination', 'is_active', 'is_latest', 'category', 'subcategory', 'difficulty']
    search_fields = ['title', 'description', 'destination', 'category', 'subcategory']
    ordering_fields = ['base_price', 'duration_days', 'rating']

    def get_queryset(self):
        if self.request.user.is_authenticated and self.request.user.role in ['SUPER_ADMIN', 'ADMIN', 'STAFF']:
            return Tour.objects.all().annotate(booking_count=Count('bookings'))
        return Tour.objects.filter(is_active=True).annotate(booking_count=Count('bookings'))

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [IsAdminOrStaff]
        return [permission() for permission in permission_classes]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        try:
            self.perform_destroy(instance)
        except ProtectedError:
            return Response(
                {
                    'detail': 'This tour cannot be deleted because it has existing bookings. Remove or reassign those bookings first.'
                },
                status=status.HTTP_409_CONFLICT,
            )

        return Response(status=status.HTTP_204_NO_CONTENT)


class TourGuideViewSet(viewsets.ModelViewSet):
    serializer_class = TourGuideSerializer
    permission_classes = [IsAdminOrStaff]
    queryset = TourGuide.objects.all()

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [IsAdminOrStaff()]

    def get_queryset(self):
        qs = TourGuide.objects.prefetch_related('languages')
        tour_slug = self.request.query_params.get('tour_slug')
        if tour_slug:
            qs = qs.filter(tour__slug=tour_slug)
        return qs

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx


class TourGuideLanguageViewSet(viewsets.ModelViewSet):
    serializer_class = TourGuideLanguageSerializer
    queryset = TourGuideLanguage.objects.all()

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [IsAdminOrStaff()]

    def get_queryset(self):
        qs = TourGuideLanguage.objects.all()
        guide_id = self.request.query_params.get('guide')
        if guide_id:
            qs = qs.filter(guide_id=guide_id)
        return qs


class TourFAQViewSet(viewsets.ModelViewSet):
    serializer_class = TourFAQSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [IsAdminOrStaff()]

    def get_queryset(self):
        qs = TourFAQ.objects.all()
        tour_slug = self.request.query_params.get('tour_slug')
        if tour_slug:
            qs = qs.filter(tour__slug=tour_slug)
        return qs
