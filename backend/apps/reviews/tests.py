from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from apps.bookings.models import BookingStatus, EventBooking, TourBooking
from apps.events.models import Event
from apps.reviews.models import Review
from apps.tours.models import Tour


class ReviewPermissionTests(APITestCase):
    def setUp(self):
        user_model = get_user_model()
        self.user = user_model.objects.create_user(
            username="reviewer",
            email="reviewer@example.com",
            password="password123",
        )
        self.client.force_authenticate(user=self.user)

        self.tour = Tour.objects.create(
            title="Everest Base Camp",
            slug="everest-base-camp",
            description="A classic Himalayan trek.",
            long_description="A classic Himalayan trek with mountain views.",
            destination="Solukhumbu",
            base_price=Decimal("15000.00"),
            duration_days=12,
            max_capacity=12,
        )

        self.event = Event.objects.create(
            title="Mountain Film Night",
            slug="mountain-film-night",
            description="Film screening for trekkers.",
            long_description="An evening event for trekkers and climbers.",
            venue="Kathmandu",
            event_date=timezone.now() + timedelta(days=10),
            base_price=Decimal("2500.00"),
            total_tickets=100,
            available_tickets=100,
        )

    def test_tour_review_requires_completed_booking(self):
        TourBooking.objects.create(
            user=self.user,
            tour=self.tour,
            travel_date=timezone.now().date() + timedelta(days=5),
            persons=2,
            total_amount=Decimal("30000.00"),
            currency="NPR",
            status=BookingStatus.CONFIRMED,
        )

        response = self.client.post(
            "/api/v1/reviews/",
            {
                "tour_id": self.tour.id,
                "rating": 5,
                "comment": "Amazing trek with excellent guides.",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn("marked completed", response.data["error"])

    def test_completed_tour_booking_can_be_reviewed_only_once(self):
        TourBooking.objects.create(
            user=self.user,
            tour=self.tour,
            travel_date=timezone.now().date() + timedelta(days=5),
            persons=2,
            total_amount=Decimal("30000.00"),
            currency="NPR",
            status=BookingStatus.COMPLETED,
        )

        payload = {
            "tour_id": self.tour.id,
            "rating": 4,
            "comment": "Well organized and worth the trip.",
        }

        first_response = self.client.post("/api/v1/reviews/", payload, format="json")
        second_response = self.client.post("/api/v1/reviews/", payload, format="json")

        self.assertEqual(first_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(second_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("already reviewed", second_response.data["error"])
        self.assertEqual(Review.objects.filter(user=self.user, tour=self.tour).count(), 1)

    def test_event_check_booking_requires_completed_status(self):
        EventBooking.objects.create(
            user=self.user,
            event=self.event,
            tickets=2,
            total_amount=Decimal("5000.00"),
            currency="NPR",
            status=BookingStatus.CONFIRMED,
        )

        initial = self.client.get(f"/api/v1/reviews/check-booking/?event_id={self.event.id}")
        self.assertEqual(initial.status_code, status.HTTP_200_OK)
        self.assertFalse(initial.data["has_booking"])
        self.assertFalse(initial.data["has_review"])

        EventBooking.objects.filter(user=self.user, event=self.event).update(status=BookingStatus.COMPLETED)

        after_completion = self.client.get(f"/api/v1/reviews/check-booking/?event_id={self.event.id}")
        self.assertEqual(after_completion.status_code, status.HTTP_200_OK)
        self.assertTrue(after_completion.data["has_booking"])
        self.assertFalse(after_completion.data["has_review"])
