import secrets

from django.db import models
from django.conf import settings
from apps.common.models import TimeStampedModel


def _gen_booking_ref():
    """Generates a unique human-readable booking reference like GTN-A1B2C3D4."""
    return f"GTN-{secrets.token_hex(4).upper()}"


class BookingStatus(models.TextChoices):
    PENDING = "PENDING", "Pending"
    CONFIRMED = "CONFIRMED", "Confirmed"
    COMPLETED = "COMPLETED", "Completed"
    CANCELLED = "CANCELLED", "Cancelled"
    REFUNDED = "REFUNDED", "Refunded"


class TourBooking(TimeStampedModel):
    # Null for guest bookings
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT,
        related_name="tour_bookings", null=True, blank=True,
    )
    tour = models.ForeignKey("tours.Tour", on_delete=models.PROTECT, related_name="bookings")

    # Human-readable booking reference shown to customer (e.g. GTN-A1B2C3D4)
    booking_reference = models.CharField(
        max_length=20, unique=True, default=_gen_booking_ref, db_index=True,
    )

    # Guest fields — populated when user is None
    guest_name = models.CharField(max_length=255, blank=True, default="")
    guest_email = models.EmailField(blank=True, default="")
    guest_phone = models.CharField(max_length=30, blank=True, default="")

    travel_date = models.DateField()
    persons = models.PositiveIntegerField()
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default="USD")
    special_requests = models.TextField(blank=True, default="")

    status = models.CharField(max_length=20, choices=BookingStatus.choices, default=BookingStatus.PENDING)
    payment_reference = models.CharField(max_length=255, blank=True, null=True)
    is_refunded = models.BooleanField(default=False)

    @property
    def customer_name(self):
        if self.user:
            return f"{self.user.first_name} {self.user.last_name}".strip() or self.user.username
        return self.guest_name

    @property
    def customer_email(self):
        return self.user.email if self.user else self.guest_email

    def __str__(self):
        return f"TourBooking {self.booking_reference} by {self.customer_email}"


class EventBooking(TimeStampedModel):
    # Null for guest bookings
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT,
        related_name="event_bookings", null=True, blank=True,
    )
    event = models.ForeignKey("events.Event", on_delete=models.PROTECT, related_name="bookings")

    # Human-readable booking reference shown to customer (e.g. GTN-A1B2C3D4)
    booking_reference = models.CharField(
        max_length=20, unique=True, default=_gen_booking_ref, db_index=True,
    )

    # Guest fields — populated when user is None
    guest_name = models.CharField(max_length=255, blank=True, default="")
    guest_email = models.EmailField(blank=True, default="")
    guest_phone = models.CharField(max_length=30, blank=True, default="")

    tickets = models.PositiveIntegerField()
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default="USD")
    special_requests = models.TextField(blank=True, default="")

    status = models.CharField(max_length=20, choices=BookingStatus.choices, default=BookingStatus.PENDING)
    payment_reference = models.CharField(max_length=255, blank=True, null=True)
    is_refunded = models.BooleanField(default=False)

    @property
    def customer_name(self):
        if self.user:
            return f"{self.user.first_name} {self.user.last_name}".strip() or self.user.username
        return self.guest_name

    @property
    def customer_email(self):
        return self.user.email if self.user else self.guest_email

    def __str__(self):
        return f"EventBooking {self.booking_reference} by {self.customer_email}"
