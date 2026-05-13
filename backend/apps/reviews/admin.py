from django.contrib import admin
from .models import Review


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "tour", "event", "rating", "is_verified_booking", "is_approved", "created_at")
    list_filter = ("rating", "is_verified_booking", "is_approved")
    search_fields = ("user__email", "comment", "tour__title", "event__title")
    list_editable = ("is_verified_booking", "is_approved")
    ordering = ("-created_at",)
    readonly_fields = ("created_at", "updated_at")
    raw_id_fields = ("user", "tour", "event")
    fieldsets = (
        (None, {"fields": ("user", "tour", "event")}),
        ("Review", {"fields": ("rating", "comment", "is_verified_booking", "is_approved")}),
        ("Timestamps", {"fields": ("created_at", "updated_at"), "classes": ("collapse",)}),
    )
