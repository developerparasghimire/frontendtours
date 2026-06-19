from django.db import models


class TranslationCache(models.Model):
    """Persistent cache for Google Translate results.
    Keyed by SHA-256 hash of source text + target language code.
    Once a (text, lang) pair is translated it is never re-sent to the API.
    """
    source_hash = models.CharField(max_length=64, db_index=True)
    target_lang = models.CharField(max_length=8)
    translated_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [("source_hash", "target_lang")]

    def __str__(self):
        return f"{self.target_lang}:{self.source_hash[:8]}…"


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class SiteConfig(models.Model):
    """Site-wide configuration for logo, footer, and social media links"""
    
    # Site Info
    site_name = models.CharField(max_length=255, default="Get Tours Nepal")
    site_tagline = models.CharField(max_length=255, blank=True, help_text="Brief tagline for the website")
    site_description = models.TextField(blank=True, help_text="Meta description for SEO")
    
    # Logo
    logo = models.ImageField(upload_to='site/', blank=True, null=True, help_text="Main site logo")
    logo_dark = models.ImageField(upload_to='site/', blank=True, null=True, help_text="Logo for dark backgrounds")
    
    # Footer
    footer_text = models.TextField(blank=True, help_text="Footer copyright and text")
    footer_logo = models.ImageField(upload_to='site/', blank=True, null=True, help_text="Logo for footer")
    
    # Contact Info
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    address = models.TextField(blank=True)
    google_map_url = models.URLField(
        max_length=1000,
        blank=True,
        help_text="Google Maps link or embed URL used on the Contact page (paste the share-link or the iframe src URL).",
    )
    
    # Social Media URLs
    facebook_url = models.URLField(blank=True, help_text="Facebook page URL")
    twitter_url = models.URLField(blank=True, help_text="Twitter/X profile URL")
    instagram_url = models.URLField(blank=True, help_text="Instagram profile URL")
    linkedin_url = models.URLField(blank=True, help_text="LinkedIn profile URL")
    youtube_url = models.URLField(blank=True, help_text="YouTube channel URL")
    tiktok_url = models.URLField(blank=True, help_text="TikTok profile URL")
    
    # Additional Links
    privacy_policy_url = models.URLField(blank=True, help_text="Privacy policy page URL")
    terms_of_service_url = models.URLField(blank=True, help_text="Terms of service page URL")

    # Homepage portfolio / collage section
    home_portfolio_link_label = models.CharField(max_length=120, blank=True, default="View portfolio")
    home_portfolio_link_url = models.CharField(
        max_length=255,
        blank=True,
        default="/tours",
        help_text="CTA target for the homepage portfolio collage. Can be an internal path like /tours or an external URL.",
    )
    home_portfolio_image_1 = models.ImageField(upload_to="site/home/", blank=True, null=True, help_text="Homepage portfolio image 1")
    home_portfolio_image_2 = models.ImageField(upload_to="site/home/", blank=True, null=True, help_text="Homepage portfolio image 2")
    home_portfolio_image_3 = models.ImageField(upload_to="site/home/", blank=True, null=True, help_text="Homepage portfolio image 3")
    home_portfolio_image_4 = models.ImageField(upload_to="site/home/", blank=True, null=True, help_text="Homepage portfolio image 4")
    home_portfolio_image_5 = models.ImageField(upload_to="site/home/", blank=True, null=True, help_text="Homepage portfolio image 5")

    # Home page — full-width gallery slider
    home_gallery_image_1 = models.ImageField(upload_to="site/gallery/", blank=True, null=True, help_text="Gallery slider image 1")
    home_gallery_image_2 = models.ImageField(upload_to="site/gallery/", blank=True, null=True, help_text="Gallery slider image 2")
    home_gallery_image_3 = models.ImageField(upload_to="site/gallery/", blank=True, null=True, help_text="Gallery slider image 3")
    home_gallery_image_4 = models.ImageField(upload_to="site/gallery/", blank=True, null=True, help_text="Gallery slider image 4")
    home_gallery_image_5 = models.ImageField(upload_to="site/gallery/", blank=True, null=True, help_text="Gallery slider image 5")
    home_gallery_image_6 = models.ImageField(upload_to="site/gallery/", blank=True, null=True, help_text="Gallery slider image 6")
    home_gallery_image_7 = models.ImageField(upload_to="site/gallery/", blank=True, null=True, help_text="Gallery slider image 7")
    home_gallery_image_8 = models.ImageField(upload_to="site/gallery/", blank=True, null=True, help_text="Gallery slider image 8")
    home_gallery_image_9 = models.ImageField(upload_to="site/gallery/", blank=True, null=True, help_text="Gallery slider image 9")
    home_gallery_image_10 = models.ImageField(upload_to="site/gallery/", blank=True, null=True, help_text="Gallery slider image 10")
    home_gallery_image_11 = models.ImageField(upload_to="site/gallery/", blank=True, null=True, help_text="Gallery slider image 11")
    home_gallery_image_12 = models.ImageField(upload_to="site/gallery/", blank=True, null=True, help_text="Gallery slider image 12")

    # Home page — "About Us" section
    home_about_heading = models.CharField(max_length=255, blank=True, default="Your Himalayan Adventure Awaits", help_text="Main heading in the home page About Us section.")
    home_about_eyebrow = models.CharField(max_length=120, blank=True, default="About Us", help_text="Small uppercase label above the home page About Us heading.")
    home_about_paragraph_1 = models.TextField(blank=True, default="", help_text="First paragraph in the home page About Us section.")
    home_about_paragraph_2 = models.TextField(blank=True, default="", help_text="Second paragraph in the home page About Us section (optional).")

    # About page — "Who We Are" editable content
    about_eyebrow = models.CharField(max_length=120, blank=True, default="Who We Are", help_text="Small label shown above the About 'Who We Are' heading.")
    about_title = models.CharField(max_length=255, blank=True, default="We Make Every Trek Meaningful", help_text="Main heading text in the About 'Who We Are' section.")
    about_paragraph_1 = models.TextField(blank=True, default="", help_text="First paragraph under the About heading.")
    about_paragraph_2 = models.TextField(blank=True, default="", help_text="Second paragraph under the About heading.")

    # Auto-generated translations for all text fields above (home about + about page)
    translations = models.JSONField(default=dict, blank=True, help_text="Auto-filled: translations of all editable text fields into supported languages.")

    updated_at = models.DateTimeField(auto_now=True)

    _TRANSLATE_FIELDS = [
        "home_about_heading", "home_about_eyebrow", "home_about_paragraph_1", "home_about_paragraph_2",
        "about_eyebrow", "about_title", "about_paragraph_1", "about_paragraph_2",
    ]

    def save(self, *args, **kwargs):
        needs = self.pk is None
        if not needs:
            try:
                old = SiteConfig.objects.get(pk=self.pk)
                needs = any(getattr(old, f) != getattr(self, f) for f in self._TRANSLATE_FIELDS)
            except SiteConfig.DoesNotExist:
                needs = True
        super().save(*args, **kwargs)
        if needs:
            from .translation_utils import auto_translate
            try:
                fields = {f: getattr(self, f) for f in self._TRANSLATE_FIELDS if getattr(self, f)}
                if fields:
                    self.translations = auto_translate(fields)
                    SiteConfig.objects.filter(pk=self.pk).update(translations=self.translations)
            except Exception:
                pass

    def __str__(self):
        return self.site_name

    class Meta:
        verbose_name = "Site Configuration"
        verbose_name_plural = "Site Configuration"


class ContactSubmission(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    subject = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} — {self.subject}"

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Contact Submission"
        verbose_name_plural = "Contact Submissions"


class NewsletterSubscription(models.Model):
    email = models.EmailField(unique=True)
    is_active = models.BooleanField(default=True)
    subscribed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.email

    class Meta:
        ordering = ["-subscribed_at"]
        verbose_name = "Newsletter Subscription"
        verbose_name_plural = "Newsletter Subscriptions"


class AboutStat(models.Model):
    """Key numbers shown in the About hero / mission blocks (value + label)"""
    label = models.CharField(max_length=120)
    value = models.CharField(max_length=120)
    order = models.PositiveIntegerField(default=0)
    translations = models.JSONField(default=dict, blank=True, help_text="Auto-filled: translations of 'label' into all supported languages.")

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"{self.value} — {self.label}"

    def save(self, *args, **kwargs):
        needs = self.pk is None
        if not needs:
            try:
                old = AboutStat.objects.get(pk=self.pk)
                needs = old.label != self.label
            except AboutStat.DoesNotExist:
                needs = True
        super().save(*args, **kwargs)
        if needs and self.label:
            from .translation_utils import auto_translate
            try:
                self.translations = auto_translate({"label": self.label})
                AboutStat.objects.filter(pk=self.pk).update(translations=self.translations)
            except Exception:
                pass


class Value(models.Model):
    """Company value / driving principle shown in Values section"""
    title = models.CharField(max_length=140)
    description = models.TextField(blank=True)
    icon_svg_path = models.TextField(blank=True, help_text="Optional SVG path for icon")
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    translations = models.JSONField(default=dict, blank=True, help_text="Auto-filled: translations of title & description.")

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        needs = self.pk is None
        if not needs:
            try:
                old = Value.objects.get(pk=self.pk)
                needs = old.title != self.title or old.description != self.description
            except Value.DoesNotExist:
                needs = True
        super().save(*args, **kwargs)
        if needs:
            from .translation_utils import auto_translate
            try:
                self.translations = auto_translate({"title": self.title, "description": self.description})
                Value.objects.filter(pk=self.pk).update(translations=self.translations)
            except Exception:
                pass


class Leader(models.Model):
    """Trail leader / team member"""
    CATEGORY_CHOICES = [
        ("guide", "Trail Leader / Guide"),
        ("team", "Office Team (CEO / Staff)"),
    ]

    name = models.CharField(max_length=140)
    role = models.CharField(max_length=140, blank=True)
    bio = models.TextField(blank=True)
    image = models.ImageField(upload_to="leaders/", blank=True, null=True)
    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        default="guide",
        help_text="'Trail Leader / Guide' shows in Trail Leaders section. 'Office Team' shows in Meet Our Team section on the About page.",
    )
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    translations = models.JSONField(default=dict, blank=True, help_text="Auto-filled: translations of role & bio.")

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        needs = self.pk is None
        if not needs:
            try:
                old = Leader.objects.get(pk=self.pk)
                needs = old.role != self.role or old.bio != self.bio
            except Leader.DoesNotExist:
                needs = True
        super().save(*args, **kwargs)
        if needs and (self.role or self.bio):
            from .translation_utils import auto_translate
            try:
                fields = {}
                if self.role:
                    fields["role"] = self.role
                if self.bio:
                    fields["bio"] = self.bio
                self.translations = auto_translate(fields)
                Leader.objects.filter(pk=self.pk).update(translations=self.translations)
            except Exception:
                pass


class Milestone(models.Model):
    year = models.CharField(max_length=20)
    text = models.CharField(max_length=255)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    translations = models.JSONField(default=dict, blank=True, help_text="Auto-filled: translations of 'text'.")

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"{self.year}: {self.text}"

    def save(self, *args, **kwargs):
        needs = self.pk is None
        if not needs:
            try:
                old = Milestone.objects.get(pk=self.pk)
                needs = old.text != self.text
            except Milestone.DoesNotExist:
                needs = True
        super().save(*args, **kwargs)
        if needs and self.text:
            from .translation_utils import auto_translate
            try:
                self.translations = auto_translate({"text": self.text})
                Milestone.objects.filter(pk=self.pk).update(translations=self.translations)
            except Exception:
                pass


class Partner(models.Model):
    """Certificate or partner organization shown on the home page"""
    name = models.CharField(max_length=140)
    logo = models.ImageField(upload_to='partners/', blank=True, null=True)
    website_url = models.URLField(blank=True, help_text="Optional link for the partner logo")
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.name


class Category(models.Model):
    """Admin-managed taxonomy for Tours and Events.

    Top-level rows are categories (parent=None); rows with a `parent` are
    sub-categories. `kind` distinguishes whether the row applies to Tours or Events.
    """
    KIND_CHOICES = [
        ("tour", "Tour"),
        ("event", "Event"),
    ]

    kind = models.CharField(max_length=10, choices=KIND_CHOICES)
    name = models.CharField(max_length=100)
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        related_name='subcategories',
        null=True,
        blank=True,
        help_text="Leave blank to create a top-level category. Set to create a sub-category under another category.",
    )
    icon = models.CharField(
        max_length=10,
        blank=True,
        default="",
        help_text="Optional emoji shown on the home 'Find Your Adventure' tile (e.g. 🏔️, 🛕). Used as a fallback when no image is uploaded.",
    )
    image = models.ImageField(
        upload_to='categories/',
        blank=True,
        null=True,
        help_text="Optional image shown on the home 'Find Your Adventure' tile. If set, it takes priority over the icon.",
    )
    description = models.CharField(max_length=255, blank=True, default="", help_text="Optional short description.")
    is_featured = models.BooleanField(
        default=False,
        help_text="If checked, this category shows in the home page 'Find Your Adventure' section (latest 6 featured).",
    )
    order = models.PositiveIntegerField(default=0, help_text="Display order (lower numbers first).")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['kind', 'order', 'name']
        verbose_name = 'Category'
        verbose_name_plural = 'Categories'
        constraints = [
            models.UniqueConstraint(
                fields=['kind', 'parent', 'name'],
                name='unique_category_per_parent_and_kind',
            ),
        ]

    def __str__(self):
        if self.parent_id:
            return f"{self.get_kind_display()} • {self.parent.name} › {self.name}"
        return f"{self.get_kind_display()} • {self.name}"

    translations = models.JSONField(default=dict, blank=True, help_text="Auto-filled: translations of name & description.")

    def clean(self):
        from django.core.exceptions import ValidationError
        # Only one nesting level allowed.
        if self.parent and self.parent.parent_id:
            raise ValidationError("Sub-categories cannot be nested further (max one level deep).")
        # Parent must be the same kind.
        if self.parent and self.parent.kind != self.kind:
            raise ValidationError("Parent category must have the same kind (tour/event).")

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        fields = {}
        if self.name: fields["name"] = self.name
        if self.description: fields["description"] = self.description
        if fields:
            try:
                self.translations = auto_translate(fields)
                Category.objects.filter(pk=self.pk).update(translations=self.translations)
            except Exception:
                pass


class EventPopup(models.Model):
    """Singleton promotional popup shown to visitors on first page load per session."""
    title = models.CharField(max_length=255, blank=True, help_text="Optional heading shown above the poster image.")
    image = models.ImageField(upload_to='popups/', blank=True, null=True, help_text="Event poster image.")
    button_text = models.CharField(max_length=100, default="View Details", help_text="CTA button label.")
    button_url = models.CharField(max_length=500, blank=True, help_text="URL the button links to (internal path or full URL).")
    is_active = models.BooleanField(default=False, help_text="Show this popup to visitors.")
    updated_at = models.DateTimeField(auto_now=True)
    translations = models.JSONField(default=dict, blank=True, help_text="Auto-filled: translations of title & button_text.")

    class Meta:
        verbose_name = "Event Popup"
        verbose_name_plural = "Event Popup"

    def __str__(self):
        return f"Event Popup — {'Active' if self.is_active else 'Inactive'}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        fields = {}
        if self.title: fields["title"] = self.title
        if self.button_text: fields["button_text"] = self.button_text
        if fields:
            try:
                self.translations = auto_translate(fields)
                EventPopup.objects.filter(pk=self.pk).update(translations=self.translations)
            except Exception:
                pass


class PageBanner(models.Model):
    """Hero / banner content for each page — editable from the admin panel."""
    PAGE_CHOICES = [
        ("home", "Home"),
        ("tours", "Tours"),
        ("events", "Events"),
        ("blog", "Blog"),
        ("about", "About"),
        ("contact", "Contact"),
        ("faqs", "FAQs"),
        ("booking", "Booking"),
        ("booking-policy", "Booking Policy"),
        ("privacy", "Privacy Policy"),
        ("terms", "Terms of Service"),
        ("search", "Search"),
    ]

    page = models.CharField(max_length=60, choices=PAGE_CHOICES, unique=True)
    title = models.CharField(max_length=255, blank=True)
    subtitle = models.CharField(max_length=255, blank=True, help_text="Short label shown above the title")
    description = models.TextField(blank=True, help_text="Longer text shown below the title")
    updated_at = models.DateTimeField(auto_now=True)
    translations = models.JSONField(default=dict, blank=True, help_text="Auto-filled: translations of title, subtitle & description.")

    class Meta:
        ordering = ["page"]
        verbose_name = "Page Banner"
        verbose_name_plural = "Page Banners"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        fields = {}
        if self.title: fields["title"] = self.title
        if self.subtitle: fields["subtitle"] = self.subtitle
        if self.description: fields["description"] = self.description
        if fields:
            try:
                self.translations = auto_translate(fields)
                PageBanner.objects.filter(pk=self.pk).update(translations=self.translations)
            except Exception:
                pass

    def __str__(self):
        return f"Banner — {self.get_page_display()}"
