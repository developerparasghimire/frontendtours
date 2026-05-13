from django.db import models
from apps.common.models import TimeStampedModel


class Testimonial(TimeStampedModel):
    name = models.CharField(max_length=100)
    location = models.CharField(max_length=100)
    text = models.TextField()
    image = models.ImageField(upload_to='testimonials/', blank=True, null=True)
    rating = models.IntegerField(default=5)
    is_active = models.BooleanField(default=True)
    order = models.IntegerField(default=0, help_text="Lower numbers appear first")

    class Meta:
        ordering = ['order', '-created_at']

    def __str__(self):
        return f"{self.name} ({self.location})"
