from decimal import Decimal

from django.db import transaction
from django.core.exceptions import ValidationError
from django.utils import timezone
from .models import TourBooking, EventBooking, BookingStatus
from apps.tours.models import Tour
from apps.events.models import Event


@transaction.atomic
def create_tour_booking(
    tour_id: int,
    travel_date,
    persons: int,
    user=None,
    guest_name: str = "",
    guest_email: str = "",
    guest_phone: str = "",
    special_requests: str = "",
) -> TourBooking:
    if user is None and not guest_email:
        raise ValidationError("Email is required to complete booking.")

    try:
        tour = Tour.objects.select_for_update().get(id=tour_id, is_active=True)
    except Tour.DoesNotExist:
        raise ValidationError("Tour not found or is inactive.")

    if travel_date < timezone.now().date():
        raise ValidationError("Travel date cannot be in the past.")

    # Check capacity
    existing_bookings = TourBooking.objects.filter(
        tour=tour,
        travel_date=travel_date,
        status__in=[
            BookingStatus.PENDING,
            BookingStatus.CONFIRMED,
            BookingStatus.COMPLETED,
        ],
    )
    total_booked = sum(b.persons for b in existing_bookings)
    if total_booked + persons > tour.max_capacity:
        raise ValidationError(f"Only {tour.max_capacity - total_booked} spots left for this date.")

    total_amount = tour.base_price * persons

    booking = TourBooking.objects.create(
        user=user,
        tour=tour,
        travel_date=travel_date,
        persons=persons,
        total_amount=total_amount,
        currency=tour.currency,
        status=BookingStatus.PENDING,
        guest_name=guest_name,
        guest_email=guest_email,
        guest_phone=guest_phone,
        special_requests=special_requests,
    )
    return booking


@transaction.atomic
def create_event_booking(
    event_id: int,
    tickets: int,
    user=None,
    guest_name: str = "",
    guest_email: str = "",
    guest_phone: str = "",
    special_requests: str = "",
) -> EventBooking:
    if user is None and not guest_email:
        raise ValidationError("Email is required to complete booking.")

    try:
        event = Event.objects.select_for_update().get(id=event_id, is_active=True)
    except Event.DoesNotExist:
        raise ValidationError("Event not found or is inactive.")

    event_dt = event.event_date
    try:
        from django.utils import timezone as dj_tz
        if dj_tz.is_naive(event_dt):
            event_dt = dj_tz.make_aware(event_dt, dj_tz.get_current_timezone())
    except Exception:
        event_dt = event.event_date

    if event_dt <= timezone.now():
        raise ValidationError("Cannot book tickets for past events.")

    available = event.available_tickets if event.available_tickets is not None else event.total_tickets
    if available < tickets:
        raise ValidationError(f"Only {available} tickets left.")

    total_amount = event.base_price * tickets

    booking = EventBooking.objects.create(
        user=user,
        event=event,
        tickets=tickets,
        total_amount=total_amount,
        currency=event.currency,
        status=BookingStatus.PENDING,
        guest_name=guest_name,
        guest_email=guest_email,
        guest_phone=guest_phone,
        special_requests=special_requests,
    )

    event.available_tickets = available - tickets
    event.save(update_fields=['available_tickets'])

    return booking
