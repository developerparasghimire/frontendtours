from rest_framework import serializers
from .models import Testimonial


def _parse_bool(value):
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        return value.lower() in ('true', '1', 'yes')
    return bool(value)


class TestimonialSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    image_file = serializers.ImageField(write_only=True, required=False, source='image')

    class Meta:
        model = Testimonial
        fields = [
            'id', 'name', 'location', 'text',
            'image', 'image_file', 'rating',
            'is_active', 'order', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_image(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

    def validate_is_active(self, value):
        return _parse_bool(value)
