from django.contrib import admin
from .models import PaymentTransaction


@admin.register(PaymentTransaction)
class PaymentTransactionAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "booking_type", "booking_reference", "amount",
                    "currency", "gateway", "status", "mpg_order_id", "created_at")
    list_filter = ("status", "gateway", "booking_type", "currency")
    search_fields = ("user__email", "transaction_id", "booking_reference",
                     "mpg_order_id", "mpg_session_id")
    ordering = ("-created_at",)
    readonly_fields = ("created_at", "updated_at", "mpg_session_id",
                       "mpg_success_indicator", "gateway_response")
    raw_id_fields = ("user",)
    fieldsets = (
        (None, {"fields": ("user", "booking_type", "booking_reference")}),
        ("Transaction", {"fields": ("amount", "currency", "gateway",
                                    "transaction_id", "status")}),
        ("MPG", {"fields": ("mpg_order_id", "mpg_session_id",
                            "mpg_success_indicator", "gateway_response"),
                 "classes": ("collapse",)}),
        ("Timestamps", {"fields": ("created_at", "updated_at"),
                        "classes": ("collapse",)}),
    )
