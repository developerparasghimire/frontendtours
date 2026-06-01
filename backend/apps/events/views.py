from django.db.models import Count
from django.db.models.deletion import ProtectedError
from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Event, EventPDFLead
from .serializers import EventSerializer
from apps.common.permissions import IsAdminOrStaff


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def event_pdf_lead_view(request):
    email = request.data.get('email', '').strip()
    event_id = request.data.get('event_id')

    if not email or '@' not in email or '.' not in email.split('@')[-1]:
        return Response({'error': 'Valid email address required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        event = Event.objects.get(pk=event_id)
    except (Event.DoesNotExist, TypeError, ValueError):
        return Response({'error': 'Event not found.'}, status=status.HTTP_404_NOT_FOUND)

    EventPDFLead.objects.get_or_create(email=email, event=event)
    return Response({'success': True})

class EventViewSet(viewsets.ModelViewSet):
    serializer_class = EventSerializer
    lookup_field = 'slug'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active', 'is_latest', 'category']
    search_fields = ['title', 'description', 'venue', 'category']
    ordering_fields = ['event_date', 'base_price']

    def get_queryset(self):
        if self.request.user.is_authenticated and self.request.user.role in ['SUPER_ADMIN', 'ADMIN', 'STAFF']:
            return Event.objects.all().annotate(booking_count=Count('bookings'))
        return Event.objects.filter(is_active=True).annotate(booking_count=Count('bookings'))

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
                    'detail': 'This event cannot be deleted because it has existing bookings. Remove or reassign those bookings first.'
                },
                status=status.HTTP_409_CONFLICT,
            )

        return Response(status=status.HTTP_204_NO_CONTENT)
