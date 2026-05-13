from django.db import models

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

    updated_at = models.DateTimeField(auto_now=True)
    
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

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"{self.value} — {self.label}"


class Value(models.Model):
    """Company value / driving principle shown in Values section"""
    title = models.CharField(max_length=140)
    description = models.TextField(blank=True)
    icon_svg_path = models.TextField(blank=True, help_text="Optional SVG path for icon")
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return self.title


class Leader(models.Model):
    """Trail leader / team member"""
    name = models.CharField(max_length=140)
    role = models.CharField(max_length=140, blank=True)
    bio = models.TextField(blank=True)
    image = models.ImageField(upload_to="leaders/", blank=True, null=True)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return self.name


class Milestone(models.Model):
    year = models.CharField(max_length=20)
    text = models.CharField(max_length=255)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"{self.year}: {self.text}"


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

    class Meta:
        ordering = ["page"]
        verbose_name = "Page Banner"
        verbose_name_plural = "Page Banners"

    def __str__(self):
        return f"Banner — {self.get_page_display()}"
