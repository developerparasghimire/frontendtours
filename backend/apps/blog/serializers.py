from rest_framework import serializers
from .models import BlogPost


def _parse_bool(value):
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        return value.lower() in ('true', '1', 'yes')
    return bool(value)


class BlogPostSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    image_file = serializers.ImageField(write_only=True, required=False, source='image')

    class Meta:
        model = BlogPost
        fields = [
            'id', 'title', 'slug', 'excerpt', 'content',
            'image', 'image_file', 'author', 'category',
            'read_time', 'tags', 'is_published', 'publish_date',
            'translations', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'publish_date', 'created_at', 'updated_at']

    def get_image(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

    def validate_is_published(self, value):
        return _parse_bool(value)
