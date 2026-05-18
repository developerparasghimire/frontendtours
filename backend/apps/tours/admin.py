from django.contrib import admin
from .models import Tour, TourGalleryImage


class TourGalleryImageInline(admin.TabularInline):
    model = TourGalleryImage
    extra = 3
    fields = ("image", "order")
    verbose_name = "Gallery Image"
    verbose_name_plural = "Gallery Images (upload here)"


@admin.register(Tour)
class TourAdmin(admin.ModelAdmin):
    list_display = ("title", "destination", "category", "subcategory", "difficulty", "base_price", "currency", "duration_days", "rating", "max_capacity", "is_active", "is_latest", "created_at")
    list_filter = ("is_active", "is_latest", "destination", "category", "subcategory", "difficulty", "currency")
    search_fields = ("title", "slug", "description", "destination", "category", "subcategory")
    prepopulated_fields = {"slug": ("title",)}
    list_editable = ("is_active", "is_latest", "base_price", "category", "difficulty", "rating")
    ordering = ("-created_at",)
    readonly_fields = ("created_at", "updated_at")
    inlines = [TourGalleryImageInline]
    fieldsets = (
        (None, {"fields": ("title", "slug", "description", "long_description")}),
        ("Featured on Home Page", {
            "fields": ("is_latest",),
            "description": "✅ Check 'Is latest' to feature this tour on the home page.",
        }),
        ("Main Image", {"fields": ("image",)}),
        ("Details", {
            "fields": ("destination", "duration_days", "max_capacity", "category", "subcategory", "difficulty", "rating", "badge"),
            "description": "Subcategory is mainly used for Trekking (e.g. Everest Region, Annapurna Region, Langtang, Manaslu, Mustang, Short Treks). Leave blank for non-trekking tours.",
        }),
        ("Tour Content", {"fields": ("highlights", "includes"), "description": "Enter as JSON arrays, e.g. [\"Item one\", \"Item two\"]"}),
        ("Pricing", {"fields": ("base_price", "currency")}),
        ("Status", {"fields": ("is_active",)}),
        ("Timestamps", {"fields": ("created_at", "updated_at"), "classes": ("collapse",)}),
    )
