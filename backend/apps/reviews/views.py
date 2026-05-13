from django.db import IntegrityError
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from .models import Review
from .serializers import ReviewSerializer, CreateReviewSerializer
from apps.bookings.models import TourBooking, EventBooking, BookingStatus
from apps.common.permissions import IsAdminOrStaff
from apps.tours.models import Tour
from apps.events.models import Event

REVIEW_ELIGIBLE_STATUS = BookingStatus.COMPLETED


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_review(request):
    """
    POST /api/v1/reviews/
    Only users with a completed booking for the tour/event can submit a review.
    One review per user per tour/event.
    """
    serializer = CreateReviewSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    user = request.user
    tour_id = serializer.validated_data.get("tour_id")
    event_id = serializer.validated_data.get("event_id")
    rating = serializer.validated_data["rating"]
    comment = serializer.validated_data["comment"]

    if tour_id:
        try:
            tour = Tour.objects.get(id=tour_id)
        except Tour.DoesNotExist:
            return Response({"error": "Tour not found."}, status=status.HTTP_404_NOT_FOUND)

        has_booking = TourBooking.objects.filter(
            user=user, tour=tour, status=REVIEW_ELIGIBLE_STATUS
        ).exists()
        if not has_booking:
            return Response(
                {"error": "You can review this tour only after your booking is marked completed."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if Review.objects.filter(user=user, tour=tour).exists():
            return Response(
                {"error": "You have already reviewed this tour."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            review = Review.objects.create(
                user=user, tour=tour, rating=rating, comment=comment, is_verified_booking=True
            )
        except IntegrityError:
            return Response(
                {"error": "You have already reviewed this tour."},
                status=status.HTTP_400_BAD_REQUEST,
            )

    else:
        try:
            event = Event.objects.get(id=event_id)
        except Event.DoesNotExist:
            return Response({"error": "Event not found."}, status=status.HTTP_404_NOT_FOUND)

        has_booking = EventBooking.objects.filter(
            user=user, event=event, status=REVIEW_ELIGIBLE_STATUS
        ).exists()
        if not has_booking:
            return Response(
                {"error": "You can review this event only after your booking is marked completed."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if Review.objects.filter(user=user, event=event).exists():
            return Response(
                {"error": "You have already reviewed this event."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            review = Review.objects.create(
                user=user, event=event, rating=rating, comment=comment, is_verified_booking=True
            )
        except IntegrityError:
            return Response(
                {"error": "You have already reviewed this event."},
                status=status.HTTP_400_BAD_REQUEST,
            )

    return Response(ReviewSerializer(review).data, status=status.HTTP_201_CREATED)


@api_view(["GET"])
@permission_classes([AllowAny])
def tour_reviews(request, tour_id):
    """GET /api/v1/reviews/tours/<tour_id>/ — all reviews for a tour."""
    reviews = Review.objects.filter(tour_id=tour_id, is_approved=True).select_related("user").order_by("-created_at")
    return Response(ReviewSerializer(reviews, many=True).data)


@api_view(["GET"])
@permission_classes([AllowAny])
def event_reviews(request, event_id):
    """GET /api/v1/reviews/events/<event_id>/ — all reviews for an event."""
    reviews = Review.objects.filter(event_id=event_id, is_approved=True).select_related("user").order_by("-created_at")
    return Response(ReviewSerializer(reviews, many=True).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def check_booking_status(request):
    """
    GET /api/v1/reviews/check-booking/?tour_id=X or ?event_id=X
    Returns whether the user has a completed booking & whether they already reviewed.
    """
    user = request.user
    tour_id = request.query_params.get("tour_id")
    event_id = request.query_params.get("event_id")

    if tour_id:
        has_booking = TourBooking.objects.filter(
            user=user, tour_id=tour_id, status=REVIEW_ELIGIBLE_STATUS
        ).exists()
        has_review = Review.objects.filter(user=user, tour_id=tour_id).exists()
    elif event_id:
        has_booking = EventBooking.objects.filter(
            user=user, event_id=event_id, status=REVIEW_ELIGIBLE_STATUS
        ).exists()
        has_review = Review.objects.filter(user=user, event_id=event_id).exists()
    else:
        return Response({"error": "Provide tour_id or event_id."}, status=status.HTTP_400_BAD_REQUEST)

    return Response({"has_booking": has_booking, "has_review": has_review})


@api_view(["GET"])
@permission_classes([IsAdminOrStaff])
def admin_reviews_list(request):
    """GET /api/v1/reviews/admin/ — list all reviews for admin moderation."""
    reviews = Review.objects.select_related("user", "tour", "event").order_by("-created_at")
    data = []
    for r in reviews:
        data.append({
            "id": r.id,
            "user_name": f"{r.user.first_name} {r.user.last_name}".strip() or r.user.username,
            "user_email": r.user.email,
            "tour_title": r.tour.title if r.tour else None,
            "tour_id": r.tour_id,
            "event_title": r.event.title if r.event else None,
            "event_id": r.event_id,
            "rating": r.rating,
            "comment": r.comment,
            "is_verified_booking": r.is_verified_booking,
            "is_approved": r.is_approved,
            "created_at": r.created_at.isoformat(),
        })
    return Response(data)


@api_view(["PATCH"])
@permission_classes([IsAdminOrStaff])
def admin_review_update(request, review_id):
    """PATCH /api/v1/reviews/admin/<id>/ — approve or reject a review."""
    try:
        review = Review.objects.get(id=review_id)
    except Review.DoesNotExist:
        return Response({"error": "Review not found."}, status=status.HTTP_404_NOT_FOUND)

    is_approved = request.data.get("is_approved")
    if is_approved is not None:
        review.is_approved = is_approved
        review.save(update_fields=["is_approved"])

    return Response(ReviewSerializer(review).data)


@api_view(["DELETE"])
@permission_classes([IsAdminOrStaff])
def admin_review_delete(request, review_id):
    """DELETE /api/v1/reviews/admin/<id>/ — delete a review."""
    try:
        review = Review.objects.get(id=review_id)
    except Review.DoesNotExist:
        return Response({"error": "Review not found."}, status=status.HTTP_404_NOT_FOUND)
    review.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
