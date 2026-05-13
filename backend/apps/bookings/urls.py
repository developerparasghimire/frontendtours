from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    MyTourBookingsViewSet, MyEventBookingsViewSet,
    CreateTourBookingAPI, CreateEventBookingAPI,
    GuestCreateTourBookingAPI, GuestCreateEventBookingAPI,
    RefundTourBookingAPI, RefundEventBookingAPI,
    AdminTourBookingsListAPI, AdminEventBookingsListAPI,
    AdminDashboardStatsAPI, AdminRecentBookingsAPI,
    AdminUpdateTourBookingStatusAPI, AdminUpdateEventBookingStatusAPI,
)

router = DefaultRouter()
router.register(r'my-tours', MyTourBookingsViewSet, basename='my-tour-bookings')
router.register(r'my-events', MyEventBookingsViewSet, basename='my-event-bookings')

urlpatterns = [
    path('', include(router.urls)),
    # Authenticated bookings
    path('tours/create/', CreateTourBookingAPI.as_view(), name='create-tour-booking'),
    path('events/create/', CreateEventBookingAPI.as_view(), name='create-event-booking'),
    # Guest bookings (no login required)
    path('tours/guest-create/', GuestCreateTourBookingAPI.as_view(), name='guest-create-tour-booking'),
    path('events/guest-create/', GuestCreateEventBookingAPI.as_view(), name='guest-create-event-booking'),

    path('tours/<int:pk>/refund/', RefundTourBookingAPI.as_view(), name='refund-tour-booking'),
    path('events/<int:pk>/refund/', RefundEventBookingAPI.as_view(), name='refund-event-booking'),

    # Admin endpoints
    path('admin/tour-bookings/', AdminTourBookingsListAPI.as_view(), name='admin-tour-bookings'),
    path('admin/event-bookings/', AdminEventBookingsListAPI.as_view(), name='admin-event-bookings'),
    path('admin/stats/', AdminDashboardStatsAPI.as_view(), name='admin-dashboard-stats'),
    path('admin/recent-bookings/', AdminRecentBookingsAPI.as_view(), name='admin-recent-bookings'),
    path('admin/tour-bookings/<int:pk>/status/', AdminUpdateTourBookingStatusAPI.as_view(), name='admin-update-tour-booking-status'),
    path('admin/event-bookings/<int:pk>/status/', AdminUpdateEventBookingStatusAPI.as_view(), name='admin-update-event-booking-status'),
]
