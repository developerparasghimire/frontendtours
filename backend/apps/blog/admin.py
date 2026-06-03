from django.contrib import admin
from django_summernote.admin import SummernoteModelAdmin
from .models import BlogPost


@admin.register(BlogPost)
class BlogPostAdmin(SummernoteModelAdmin):
    summernote_fields = ('content', 'excerpt')
    list_display = ['title', 'category', 'author', 'is_published', 'publish_date']
    list_filter = ['category', 'is_published']
    search_fields = ['title', 'excerpt', 'tags', 'author']
    prepopulated_fields = {'slug': ('title',)}
    list_editable = ['is_published']
    fieldsets = (
        ('Content', {'fields': ('title', 'slug', 'excerpt', 'content', 'image')}),
        ('Meta', {'fields': ('author', 'category', 'read_time', 'tags', 'is_published')}),
    )
