from django.contrib import admin
from .models import TourBooking, EventBooking


@admin.register(TourBooking)
class TourBookingAdmin(admin.ModelAdmin):
    list_display = ("booking_reference", "customer_name", "customer_email", "tour", "travel_date", "persons", "total_amount", "status", "is_refunded", "created_at")
    list_filter = ("status", "is_refunded", "travel_date", "tour")
    search_fields = ("booking_reference", "user__email", "guest_email", "guest_name", "tour__title", "payment_reference")
    list_editable = ("status",)
    ordering = ("-created_at",)
    readonly_fields = ("booking_reference", "created_at", "updated_at")
    raw_id_fields = ("user", "tour")
    fieldsets = (
        (None, {"fields": ("booking_reference", "user", "tour")}),
        ("Customer (guest bookings)", {"fields": ("guest_name", "guest_email", "guest_phone")}),
        ("Booking Details", {"fields": ("travel_date", "persons", "special_requests")}),
        ("Payment", {"fields": ("total_amount", "currency", "payment_reference", "is_refunded")}),
        ("Status", {"fields": ("status",)}),
        ("Timestamps", {"fields": ("created_at", "updated_at"), "classes": ("collapse",)}),
    )


@admin.register(EventBooking)
class EventBookingAdmin(admin.ModelAdmin):
    list_display = ("booking_reference", "customer_name", "customer_email", "event", "tickets", "total_amount", "status", "is_refunded", "created_at")
    list_filter = ("status", "is_refunded", "event")
    search_fields = ("booking_reference", "user__email", "guest_email", "guest_name", "event__title", "payment_reference")
    list_editable = ("status",)
    ordering = ("-created_at",)
    readonly_fields = ("booking_reference", "created_at", "updated_at")
    raw_id_fields = ("user", "event")
    fieldsets = (
        (None, {"fields": ("booking_reference", "user", "event")}),
        ("Customer (guest bookings)", {"fields": ("guest_name", "guest_email", "guest_phone")}),
        ("Booking Details", {"fields": ("tickets", "special_requests")}),
        ("Payment", {"fields": ("total_amount", "currency", "payment_reference", "is_refunded")}),
        ("Status", {"fields": ("status",)}),
        ("Timestamps", {"fields": ("created_at", "updated_at"), "classes": ("collapse",)}),
    )
