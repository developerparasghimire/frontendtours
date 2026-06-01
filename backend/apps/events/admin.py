from django.contrib import admin
from .models import Event, EventPDFLead


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ("title", "venue", "category", "event_date", "base_price", "total_tickets", "available_tickets", "is_active", "is_latest", "created_at")
    list_filter = ("is_active", "is_latest", "category", "venue", "event_date")
    search_fields = ("title", "slug", "description", "venue", "category")
    prepopulated_fields = {"slug": ("title",)}
    list_editable = ("is_active", "is_latest", "base_price", "category")
    ordering = ("-event_date",)
    readonly_fields = ("created_at", "updated_at")
    fieldsets = (
        (None, {"fields": ("title", "slug", "description", "long_description")}),
        ("Media", {"fields": ("image",)}),
        ("Event Details", {"fields": ("venue", "event_date", "category")}),
        ("Event Content", {"fields": ("highlights", "gallery"), "description": 'Enter as JSON array, e.g. ["Live music", "Food stalls"]'}),
        ("Tickets & Pricing", {"fields": ("base_price", "currency", "total_tickets", "available_tickets")}),
        ("Event Plan PDF", {"fields": ("pdf",), "description": "Upload a PDF of the event program. Users will enter their email before downloading."}),
        ("Status", {"fields": ("is_active", "is_latest")}),
        ("Timestamps", {"fields": ("created_at", "updated_at"), "classes": ("collapse",)}),
    )


@admin.register(EventPDFLead)
class EventPDFLeadAdmin(admin.ModelAdmin):
    list_display = ("email", "event", "created_at")
    list_filter = ("event",)
    search_fields = ("email",)
    readonly_fields = ("email", "event", "created_at")
    ordering = ("-created_at",)
