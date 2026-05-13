from django.urls import path

from .views import (
    MPGInitiatePaymentAPI,
    MPGReturnView,
    MPGWebhookView,
    PaymentStatusAPI,
    GuestPaymentStatusAPI,
)

urlpatterns = [
    # MPG (Mastercard Payment Gateway / Fingent)
    path("mpg/initiate/", MPGInitiatePaymentAPI.as_view(), name="payment-mpg-initiate"),
    path("mpg/return/",   MPGReturnView.as_view(),         name="payment-mpg-return"),
    path("mpg/webhook/",  MPGWebhookView.as_view(),        name="payment-mpg-webhook"),

    # Authenticated user status polling
    path("<str:order_id>/status/", PaymentStatusAPI.as_view(), name="payment-status"),

    # Guest booking status by GTN reference (e.g. ?ref=GTN-ABCD1234)
    path("mpg/guest-status/", GuestPaymentStatusAPI.as_view(), name="payment-guest-status"),
]
