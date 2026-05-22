from django.contrib import admin
from .models import SiteConfig, ContactSubmission, NewsletterSubscription
from .models import AboutStat, Value, Leader, Milestone, PageBanner, Partner, Category


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "kind", "parent", "icon", "is_featured", "order", "is_active", "updated_at")
    list_filter = ("kind", "is_active", "is_featured")
    search_fields = ("name", "parent__name")
    list_editable = ("order", "is_active", "is_featured")
    autocomplete_fields = ("parent",)
    ordering = ("kind", "order", "name")
    fields = ("kind", "name", "parent", "icon", "image", "description", "is_featured", "order", "is_active")


@admin.register(SiteConfig)
class SiteConfigAdmin(admin.ModelAdmin):
    list_display = ("site_name", "email", "phone", "updated_at")
    readonly_fields = ("updated_at",)
    
    fieldsets = (
        ("Site Information", {
            "fields": ("site_name", "site_tagline", "site_description")
        }),
        ("Branding", {
            "fields": ("logo", "logo_dark", "footer_logo")
        }),
        ("Homepage Portfolio Showcase", {
            "fields": (
                "home_portfolio_link_label",
                "home_portfolio_link_url",
                "home_portfolio_image_1",
                "home_portfolio_image_2",
                "home_portfolio_image_3",
                "home_portfolio_image_4",
                "home_portfolio_image_5",
            )
        }),
        ("About Page — 'Who We Are' content", {
            "fields": (
                "about_eyebrow",
                "about_title",
                "about_paragraph_1",
                "about_paragraph_2",
            ),
            "description": "Shown in the About page 'Who We Are' section. The stat numbers (10K+, 150+, 50+) are managed under 'About Stats'.",
        }),
        ("Footer", {
            "fields": ("footer_text",)
        }),
        ("Contact Information", {
            "fields": ("phone", "email", "address", "google_map_url")
        }),
        ("Social Media", {
            "fields": ("facebook_url", "twitter_url", "instagram_url", "linkedin_url", "youtube_url", "tiktok_url")
        }),
        ("Additional Links", {
            "fields": ("privacy_policy_url", "terms_of_service_url")
        }),
        ("Timestamps", {
            "fields": ("updated_at",),
            "classes": ("collapse",)
        }),
    )
    
    def has_add_permission(self, request):
        """Allow only one SiteConfig instance"""
        return not SiteConfig.objects.exists()
    
    def has_delete_permission(self, request, obj=None):
        """Prevent deletion of SiteConfig"""
        return False


@admin.register(ContactSubmission)
class ContactSubmissionAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "subject", "is_read", "created_at")
    list_filter = ("is_read",)
    search_fields = ("name", "email", "subject", "message")
    readonly_fields = ("name", "email", "phone", "subject", "message", "created_at")
    ordering = ("-created_at",)
    
    def has_add_permission(self, request):
        return False


@admin.register(NewsletterSubscription)
class NewsletterSubscriptionAdmin(admin.ModelAdmin):
    list_display = ("email", "is_active", "subscribed_at")
    list_filter = ("is_active",)
    search_fields = ("email",)
    readonly_fields = ("email", "subscribed_at")
    ordering = ("-subscribed_at",)

    def has_add_permission(self, request):
        return False


@admin.register(AboutStat)
class AboutStatAdmin(admin.ModelAdmin):
    list_display = ('label', 'value', 'order')
    ordering = ('order',)


@admin.register(Value)
class ValueAdmin(admin.ModelAdmin):
    list_display = ('title', 'order', 'is_active')
    list_filter = ('is_active',)
    ordering = ('order',)


@admin.register(Leader)
class LeaderAdmin(admin.ModelAdmin):
    list_display = ('name', 'role', 'category', 'order', 'is_active')
    list_filter = ('is_active', 'category')
    ordering = ('category', 'order')


@admin.register(Milestone)
class MilestoneAdmin(admin.ModelAdmin):
    list_display = ('year', 'text', 'order', 'is_active')
    list_filter = ('is_active',)
    ordering = ('order',)


@admin.register(PageBanner)
class PageBannerAdmin(admin.ModelAdmin):
    list_display = ('page', 'title', 'subtitle', 'updated_at')
    readonly_fields = ('updated_at',)
    ordering = ('page',)


@admin.register(Partner)
class PartnerAdmin(admin.ModelAdmin):
    list_display = ('name', 'website_url', 'order', 'is_active')
    list_filter = ('is_active',)
    ordering = ('order',)
