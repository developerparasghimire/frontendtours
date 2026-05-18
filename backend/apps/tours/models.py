from django.db import models
from django.conf import settings
from apps.common.models import TimeStampedModel

class Tour(TimeStampedModel):
    DIFFICULTY_CHOICES = [
        ("Easy", "Easy"),
        ("Moderate", "Moderate"),
        ("Challenging", "Challenging"),
        ("Extreme", "Extreme"),
    ]

    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    description = models.TextField(help_text="Short summary shown on cards (2-3 lines).")
    long_description = models.TextField(blank=True, help_text="Full description shown on detail page. Separate paragraphs with blank lines.")
    destination = models.CharField(max_length=255, default="Nepal")
    
    image = models.ImageField(upload_to='tours/', blank=True, null=True)
    gallery = models.JSONField(default=list, blank=True, help_text='List of image URLs, e.g. ["https://…", "https://…"]')

    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default="USD")
    
    duration_days = models.PositiveIntegerField(default=1)
    
    category = models.CharField(max_length=100, default="Adventure", help_text="e.g. Adventure, Cultural, Trekking, Wildlife, Spiritual, Day Trip")
    subcategory = models.CharField(
        max_length=100,
        blank=True,
        default="",
        help_text="Optional sub-category — primarily for Trekking (e.g. Everest Region, Annapurna Region, Langtang, Manaslu, Mustang, Short Treks).",
    )
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default="Moderate")
    rating = models.DecimalField(max_digits=2, decimal_places=1, default=4.5)
    badge = models.CharField(max_length=50, blank=True, help_text="e.g. Best Seller, New, Popular")
    
    highlights = models.JSONField(default=list, blank=True, help_text='Tour highlights, e.g. ["Sunrise view", "Guided trek"]')
    includes = models.JSONField(default=list, blank=True, help_text='What is included, e.g. ["Hotel pickup", "Meals", "Guide"]')

    max_capacity = models.PositiveIntegerField()
    is_active = models.BooleanField(default=True)
    is_latest = models.BooleanField(default=False, help_text="Show on the home page as a featured latest tour.")
    
    def __str__(self):
        return self.title


class TourGalleryImage(models.Model):
    """Gallery images uploaded via the Django admin for a tour."""
    tour = models.ForeignKey(Tour, on_delete=models.CASCADE, related_name='gallery_images')
    image = models.ImageField(upload_to='tours/gallery/')
    order = models.PositiveIntegerField(default=0, help_text="Display order (lower numbers appear first)")

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"Gallery image for {self.tour.title}"
