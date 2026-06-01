from django.db import models
from django.conf import settings
from apps.common.models import TimeStampedModel

class Event(TimeStampedModel):
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    description = models.TextField(help_text="Short summary shown on cards (2-3 lines).")
    long_description = models.TextField(blank=True, help_text="Full description for event detail page. Separate paragraphs with blank lines.")
    venue = models.CharField(max_length=255)
    
    image = models.ImageField(upload_to='events/', blank=True, null=True)
    event_date = models.DateTimeField()
    
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default="USD")
    
    category = models.CharField(max_length=100, default="Culture", help_text="e.g. Music, Culture, Festivals, Food, Sports, Workshops")
    highlights = models.JSONField(default=list, blank=True, help_text='Event highlights, e.g. ["Live music", "Food stalls"]')
    gallery = models.JSONField(default=list, blank=True, help_text='Gallery image URLs')

    total_tickets = models.PositiveIntegerField()
    available_tickets = models.PositiveIntegerField()
    is_active = models.BooleanField(default=True)
    is_latest = models.BooleanField(default=False, help_text="Show on the home page as a featured latest event.")
    pdf = models.FileField(upload_to='events/pdfs/', blank=True, null=True, help_text="Downloadable event plan PDF (optional)")

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.pk:
            self.available_tickets = self.total_tickets
        super().save(*args, **kwargs)


class EventPDFLead(models.Model):
    email = models.EmailField()
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='pdf_leads')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = [('email', 'event')]

    def __str__(self):
        return f"{self.email} — {self.event.title}"
