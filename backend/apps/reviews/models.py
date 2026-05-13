from django.db import models
from django.conf import settings
from apps.common.models import TimeStampedModel
from django.core.validators import MinValueValidator, MaxValueValidator

class Review(TimeStampedModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="reviews")
    tour = models.ForeignKey("tours.Tour", null=True, blank=True, on_delete=models.CASCADE, related_name="reviews")
    event = models.ForeignKey("events.Event", null=True, blank=True, on_delete=models.CASCADE, related_name="reviews")
    
    rating = models.PositiveIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField()
    is_verified_booking = models.BooleanField(default=False)
    is_approved = models.BooleanField(default=False)
    
    class Meta:
        constraints = [
            models.CheckConstraint(
                condition=(models.Q(tour__isnull=False) & models.Q(event__isnull=True)) |
                      (models.Q(tour__isnull=True) & models.Q(event__isnull=False)),
                name='review_must_belong_to_tour_or_event'
            ),
            models.UniqueConstraint(
                fields=["user", "tour"],
                condition=models.Q(tour__isnull=False),
                name="unique_review_per_user_tour",
            ),
            models.UniqueConstraint(
                fields=["user", "event"],
                condition=models.Q(event__isnull=False),
                name="unique_review_per_user_event",
            ),
        ]

    def __str__(self):
        return f"Review by {self.user.email} - {self.rating}/5"
