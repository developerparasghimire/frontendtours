from django.urls import path
from . import views

urlpatterns = [
    path("", views.create_review, name="create-review"),
    path("tours/<int:tour_id>/", views.tour_reviews, name="tour-reviews"),
    path("events/<int:event_id>/", views.event_reviews, name="event-reviews"),
    path("check-booking/", views.check_booking_status, name="check-booking-status"),
    path("admin/", views.admin_reviews_list, name="admin-reviews-list"),
    path("admin/<int:review_id>/", views.admin_review_update, name="admin-review-update"),
    path("admin/<int:review_id>/delete/", views.admin_review_delete, name="admin-review-delete"),
]
