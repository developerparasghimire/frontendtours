from rest_framework import views, viewsets, permissions, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from django.core.exceptions import PermissionDenied, ValidationError
from django.db.models import Sum, Count
from django.utils import timezone
from datetime import timedelta
from .models import TourBooking, EventBooking
from .serializers import (
    CreateTourBookingSerializer, TourBookingSerializer,
    CreateEventBookingSerializer, EventBookingSerializer,
    AdminTourBookingSerializer, AdminEventBookingSerializer,
)
from .services import create_tour_booking, create_event_booking
from .refund_services import cancel_and_refund_tour, cancel_and_refund_event
from apps.common.permissions import IsOwnerOrAdmin, IsAdminOrStaff
from apps.payments.services import initiate_payment
from apps.payments.mpg_client import MPGAPIError, MPGConfigurationError


def _initiate_booking_payment(booking, booking_type, gateway, request_data, request):
    """Shared helper: initiate payment for a tour or event booking and return Response data."""
    try:
        payment = initiate_payment(
            gateway=gateway,
            booking_id=booking.id,
            booking_type=booking_type,
            success_url=request_data.get('success_url', ''),
            cancel_url=request_data.get('cancel_url', ''),
            request_origin=request.build_absolute_uri('/').rstrip('/'),
        )
    except MPGConfigurationError:
        serializer_class = TourBookingSerializer if booking_type == "TOUR" else EventBookingSerializer
        return Response(
            {"detail": "Payment gateway is not configured.", "booking": serializer_class(booking).data},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )
    except MPGAPIError as exc:
        serializer_class = TourBookingSerializer if booking_type == "TOUR" else EventBookingSerializer
        return Response(
            {"detail": str(exc), "booking": serializer_class(booking).data},
            status=status.HTTP_502_BAD_GATEWAY,
        )
    return payment


class MyTourBookingsViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]
    serializer_class = TourBookingSerializer

    def get_queryset(self):
        return TourBooking.objects.filter(user=self.request.user).select_related('tour').order_by('-created_at')


class MyEventBookingsViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]
    serializer_class = EventBookingSerializer

    def get_queryset(self):
        return EventBooking.objects.filter(user=self.request.user).select_related('event').order_by('-created_at')


class CreateTourBookingAPI(views.APIView):
    """Authenticated tour booking. User details auto-filled from JWT."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = CreateTourBookingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            booking = create_tour_booking(
                user=request.user,
                tour_id=serializer.validated_data['tour_id'],
                travel_date=serializer.validated_data['travel_date'],
                persons=serializer.validated_data['persons'],
                special_requests=serializer.validated_data.get('special_requests', ''),
            )
        except ValidationError as exc:
            return Response({"detail": exc.message}, status=status.HTTP_400_BAD_REQUEST)

        gateway = serializer.validated_data.get('gateway', 'MPG')
        payment = _initiate_booking_payment(booking, "TOUR", gateway, request.data, request)
        if isinstance(payment, Response):
            return payment

        return Response({
            "message": "Booking initiated successfully.",
            "booking": TourBookingSerializer(booking).data,
            "payment_url": payment["payment_url"],
            "payment": payment,
        }, status=status.HTTP_201_CREATED)


class CreateEventBookingAPI(views.APIView):
    """Authenticated event booking."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = CreateEventBookingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            booking = create_event_booking(
                user=request.user,
                event_id=serializer.validated_data['event_id'],
                tickets=serializer.validated_data['tickets'],
                special_requests=serializer.validated_data.get('special_requests', ''),
            )
        except ValidationError as exc:
            return Response({"detail": exc.message}, status=status.HTTP_400_BAD_REQUEST)

        gateway = serializer.validated_data.get('gateway', 'MPG')
        payment = _initiate_booking_payment(booking, "EVENT", gateway, request.data, request)
        if isinstance(payment, Response):
            return payment

        return Response({
            "message": "Booking initiated successfully.",
            "booking": EventBookingSerializer(booking).data,
            "payment_url": payment["payment_url"],
            "payment": payment,
        }, status=status.HTTP_201_CREATED)


class GuestCreateTourBookingAPI(views.APIView):
    """Guest tour booking — no authentication required."""
    permission_classes = [permissions.AllowAny]
    authentication_classes = []
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "guest_booking"

    def post(self, request):
        serializer = CreateTourBookingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        guest_email = serializer.validated_data.get('guest_email', '').strip()
        guest_name = serializer.validated_data.get('guest_name', '').strip()
        guest_phone = serializer.validated_data.get('guest_phone', '').strip()

        if not guest_email:
            return Response({"detail": "Email is required for guest booking."}, status=status.HTTP_400_BAD_REQUEST)
        if not guest_name:
            return Response({"detail": "Full name is required for guest booking."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            booking = create_tour_booking(
                user=None,
                tour_id=serializer.validated_data['tour_id'],
                travel_date=serializer.validated_data['travel_date'],
                persons=serializer.validated_data['persons'],
                guest_name=guest_name,
                guest_email=guest_email,
                guest_phone=guest_phone,
                special_requests=serializer.validated_data.get('special_requests', ''),
            )
        except ValidationError as exc:
            return Response({"detail": exc.message}, status=status.HTTP_400_BAD_REQUEST)

        gateway = serializer.validated_data.get('gateway', 'MPG')
        payment = _initiate_booking_payment(booking, "TOUR", gateway, request.data, request)
        if isinstance(payment, Response):
            return payment

        return Response({
            "message": "Booking initiated successfully.",
            "booking": TourBookingSerializer(booking).data,
            "payment_url": payment["payment_url"],
            "payment": payment,
        }, status=status.HTTP_201_CREATED)


class GuestCreateEventBookingAPI(views.APIView):
    """Guest event booking — no authentication required."""
    permission_classes = [permissions.AllowAny]
    authentication_classes = []
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "guest_booking"

    def post(self, request):
        serializer = CreateEventBookingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        guest_email = serializer.validated_data.get('guest_email', '').strip()
        guest_name = serializer.validated_data.get('guest_name', '').strip()
        guest_phone = serializer.validated_data.get('guest_phone', '').strip()

        if not guest_email:
            return Response({"detail": "Email is required for guest booking."}, status=status.HTTP_400_BAD_REQUEST)
        if not guest_name:
            return Response({"detail": "Full name is required for guest booking."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            booking = create_event_booking(
                user=None,
                event_id=serializer.validated_data['event_id'],
                tickets=serializer.validated_data['tickets'],
                guest_name=guest_name,
                guest_email=guest_email,
                guest_phone=guest_phone,
                special_requests=serializer.validated_data.get('special_requests', ''),
            )
        except ValidationError as exc:
            return Response({"detail": exc.message}, status=status.HTTP_400_BAD_REQUEST)

        gateway = serializer.validated_data.get('gateway', 'MPG')
        payment = _initiate_booking_payment(booking, "EVENT", gateway, request.data, request)
        if isinstance(payment, Response):
            return payment

        return Response({
            "message": "Booking initiated successfully.",
            "booking": EventBookingSerializer(booking).data,
            "payment_url": payment["payment_url"],
            "payment": payment,
        }, status=status.HTTP_201_CREATED)


class RefundTourBookingAPI(views.APIView):
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]

    def post(self, request, pk):
        try:
            booking = cancel_and_refund_tour(user=request.user, booking_id=pk)
        except PermissionDenied as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_403_FORBIDDEN)
        except ValidationError as exc:
            return Response({"detail": exc.message if hasattr(exc, 'message') else str(exc)},
                            status=status.HTTP_400_BAD_REQUEST)
        return Response({"message": "Refund processed.", "status": booking.status})

class RefundEventBookingAPI(views.APIView):
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]

    def post(self, request, pk):
        try:
            booking = cancel_and_refund_event(user=request.user, booking_id=pk)
        except PermissionDenied as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_403_FORBIDDEN)
        except ValidationError as exc:
            return Response({"detail": exc.message if hasattr(exc, 'message') else str(exc)},
                            status=status.HTTP_400_BAD_REQUEST)
        return Response({"message": "Refund processed.", "status": booking.status})


# ── Admin-only views ──

class _AdminBookingPagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = "page_size"
    max_page_size = 200


class AdminTourBookingsListAPI(views.APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminOrStaff]
    pagination_class = _AdminBookingPagination

    def get(self, request):
        qs = TourBooking.objects.select_related('user', 'tour').order_by('-created_at')
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(qs, request, view=self)
        serializer = AdminTourBookingSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)


class AdminEventBookingsListAPI(views.APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminOrStaff]
    pagination_class = _AdminBookingPagination

    def get(self, request):
        qs = EventBooking.objects.select_related('user', 'event').order_by('-created_at')
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(qs, request, view=self)
        serializer = AdminEventBookingSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)


class AdminDashboardStatsAPI(views.APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminOrStaff]

    def get(self, request):
        from apps.tours.models import Tour
        from apps.events.models import Event

        now = timezone.now()
        week_start = now - timedelta(days=7)
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        tour_bookings = TourBooking.objects.aggregate(
            total=Count('id'),
            revenue=Sum('total_amount'),
        )
        event_bookings = EventBooking.objects.aggregate(
            total=Count('id'),
            revenue=Sum('total_amount'),
        )

        tour_week = TourBooking.objects.filter(created_at__gte=week_start).aggregate(
            total=Count('id'), revenue=Sum('total_amount')
        )
        event_week = EventBooking.objects.filter(created_at__gte=week_start).aggregate(
            total=Count('id'), revenue=Sum('total_amount')
        )
        tour_month = TourBooking.objects.filter(created_at__gte=month_start).aggregate(
            total=Count('id'), revenue=Sum('total_amount')
        )
        event_month = EventBooking.objects.filter(created_at__gte=month_start).aggregate(
            total=Count('id'), revenue=Sum('total_amount')
        )

        pending_tours = TourBooking.objects.filter(status='PENDING').count()
        pending_events = EventBooking.objects.filter(status='PENDING').count()

        return Response({
            # All-time
            'tours_count': Tour.objects.count(),
            'events_count': Event.objects.count(),
            'tour_bookings': tour_bookings['total'] or 0,
            'event_bookings': event_bookings['total'] or 0,
            'tour_revenue': str(tour_bookings['revenue'] or 0),
            'event_revenue': str(event_bookings['revenue'] or 0),
            # This week
            'tour_bookings_week': tour_week['total'] or 0,
            'event_bookings_week': event_week['total'] or 0,
            'tour_revenue_week': str(tour_week['revenue'] or 0),
            'event_revenue_week': str(event_week['revenue'] or 0),
            # This month
            'tour_bookings_month': tour_month['total'] or 0,
            'event_bookings_month': event_month['total'] or 0,
            'tour_revenue_month': str(tour_month['revenue'] or 0),
            'event_revenue_month': str(event_month['revenue'] or 0),
            # Pending
            'pending_tour_bookings': pending_tours,
            'pending_event_bookings': pending_events,
        })


class AdminRecentBookingsAPI(views.APIView):
    """Returns the 20 most recent tour + event bookings merged and sorted by date.
    Each item has a `booking_type` ('tour' or 'event') and `is_new` flag (created in last 24h)."""
    permission_classes = [permissions.IsAuthenticated, IsAdminOrStaff]

    def get(self, request):
        now = timezone.now()
        new_threshold = now - timedelta(hours=24)
        limit = int(request.query_params.get('limit', 20))

        tour_qs = TourBooking.objects.select_related('user', 'tour').order_by('-created_at')[:limit]
        event_qs = EventBooking.objects.select_related('user', 'event').order_by('-created_at')[:limit]

        results = []
        for b in tour_qs:
            results.append({
                'id': b.id,
                'booking_reference': b.booking_reference,
                'booking_type': 'tour',
                'title': b.tour.title,
                'user_email': b.customer_email,
                'customer_name': b.customer_name,
                'amount': str(b.total_amount),
                'currency': b.currency,
                'status': b.status,
                'persons': b.persons,
                'travel_date': str(b.travel_date),
                'created_at': b.created_at.isoformat(),
                'is_new': b.created_at >= new_threshold,
            })
        for b in event_qs:
            results.append({
                'id': b.id,
                'booking_reference': b.booking_reference,
                'booking_type': 'event',
                'title': b.event.title,
                'user_email': b.customer_email,
                'customer_name': b.customer_name,
                'currency': b.currency,
                'status': b.status,
                'tickets': b.tickets,
                'created_at': b.created_at.isoformat(),
                'is_new': b.created_at >= new_threshold,
            })

        results.sort(key=lambda x: x['created_at'], reverse=True)
        return Response(results[:limit])


class AdminUpdateTourBookingStatusAPI(views.APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminOrStaff]

    def patch(self, request, pk):
        try:
            booking = TourBooking.objects.get(pk=pk)
        except TourBooking.DoesNotExist:
            return Response({"error": "Booking not found."}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get('status')
        valid = [c[0] for c in TourBooking._meta.get_field('status').choices]
        if new_status not in valid:
            return Response({"error": f"Invalid status. Must be one of {valid}"}, status=status.HTTP_400_BAD_REQUEST)

        booking.status = new_status
        if new_status == 'REFUNDED':
            booking.is_refunded = True
        booking.save()
        return Response(AdminTourBookingSerializer(booking).data)


class AdminUpdateEventBookingStatusAPI(views.APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminOrStaff]

    def patch(self, request, pk):
        try:
            booking = EventBooking.objects.get(pk=pk)
        except EventBooking.DoesNotExist:
            return Response({"error": "Booking not found."}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get('status')
        valid = [c[0] for c in EventBooking._meta.get_field('status').choices]
        if new_status not in valid:
            return Response({"error": f"Invalid status. Must be one of {valid}"}, status=status.HTTP_400_BAD_REQUEST)

        old_status = booking.status
        booking.status = new_status
        if new_status == 'REFUNDED':
            booking.is_refunded = True
            # Restore tickets
            if old_status != 'REFUNDED':
                booking.event.available_tickets += booking.tickets
                booking.event.save()
        booking.save()
        return Response(AdminEventBookingSerializer(booking).data)
