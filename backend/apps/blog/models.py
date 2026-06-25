from django.db import models
from apps.common.models import TimeStampedModel
from apps.common.translation_utils import auto_translate


class BlogPost(TimeStampedModel):
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    excerpt = models.TextField()
    content = models.TextField(blank=True, help_text="Full article content. Separate paragraphs with blank lines.")
    image = models.ImageField(upload_to='blog/', blank=True, null=True)
    author = models.CharField(max_length=100, default="Get Tours Team")
    category = models.CharField(max_length=100, default="Travel Tips")
    read_time = models.CharField(max_length=50, default="5 min read")
    tags = models.CharField(max_length=500, blank=True, help_text="Comma-separated tags, e.g. Nepal, Trekking")
    is_published = models.BooleanField(default=True)
    publish_date = models.DateField(auto_now_add=True)

    translations = models.JSONField(default=dict, blank=True, help_text="Auto-filled: translations of text fields into all supported languages.")

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        fields = {}
        if self.title: fields["title"] = self.title
        if self.excerpt: fields["excerpt"] = self.excerpt
        if self.content: fields["content"] = self.content
        if self.category: fields["category"] = self.category
        if self.read_time: fields["read_time"] = self.read_time
        if fields:
            try:
                self.translations = auto_translate(fields)
                BlogPost.objects.filter(pk=self.pk).update(translations=self.translations)
            except Exception:
                pass


class BlogFAQ(models.Model):
    post = models.ForeignKey(BlogPost, on_delete=models.CASCADE, related_name='faqs')
    question = models.CharField(max_length=500)
    answer = models.TextField()
    order = models.PositiveIntegerField(default=0, help_text="Display order (lower = first)")
    translations = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.question[:60]} ({self.post.title})"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        fields = {}
        if self.question: fields["question"] = self.question
        if self.answer: fields["answer"] = self.answer
        if fields:
            try:
                self.translations = auto_translate(fields)
                BlogFAQ.objects.filter(pk=self.pk).update(translations=self.translations)
            except Exception:
                pass
