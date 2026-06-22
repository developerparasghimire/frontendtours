from django.db import models
from django.conf import settings
from apps.common.models import TimeStampedModel
from apps.common.translation_utils import auto_translate

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

    translations = models.JSONField(default=dict, blank=True, help_text="Auto-filled: translations of text fields into all supported languages.")

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.pk:
            self.available_tickets = self.total_tickets
        super().save(*args, **kwargs)
        fields = {}
        if self.title: fields["title"] = self.title
        if self.description: fields["description"] = self.description
        if self.long_description: fields["long_description"] = self.long_description
        if self.venue: fields["venue"] = self.venue
        if self.highlights: fields["highlights"] = "\n".join(self.highlights)
        if fields:
            try:
                self.translations = auto_translate(fields)
                Event.objects.filter(pk=self.pk).update(translations=self.translations)
            except Exception:
                pass


class EventFAQ(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='faqs')
    question = models.CharField(max_length=500)
    answer = models.TextField()
    order = models.PositiveIntegerField(default=0, help_text="Display order (lower = first)")
    translations = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.question[:60]} ({self.event.title})"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        fields = {}
        if self.question: fields["question"] = self.question
        if self.answer: fields["answer"] = self.answer
        if fields:
            try:
                self.translations = auto_translate(fields)
                EventFAQ.objects.filter(pk=self.pk).update(translations=self.translations)
            except Exception:
                pass


class EventPDFLead(models.Model):
    email = models.EmailField()
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='pdf_leads')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = [('email', 'event')]

    def __str__(self):
        return f"{self.email} — {self.event.title}"
