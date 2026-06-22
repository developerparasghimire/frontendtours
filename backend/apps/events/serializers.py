import json
import os
from django.core.files.storage import default_storage
from django.core.validators import FileExtensionValidator
from rest_framework import serializers
from .models import Event, EventFAQ, EventPDFLead

MAX_IMAGE_BYTES = 5 * 1024 * 1024  # 5 MB
ALLOWED_IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'gif']


def _validate_image_file(f):
    if hasattr(f, 'size') and f.size and f.size > MAX_IMAGE_BYTES:
        raise serializers.ValidationError(
            f"Image file too large (max {MAX_IMAGE_BYTES // (1024*1024)} MB)."
        )
    name = getattr(f, 'name', '') or ''
    ext = name.rsplit('.', 1)[-1].lower() if '.' in name else ''
    if ext and ext not in ALLOWED_IMAGE_EXTS:
        raise serializers.ValidationError(
            f"Unsupported image type '.{ext}'. Allowed: {', '.join(ALLOWED_IMAGE_EXTS)}."
        )
    return f


def _parse_json_field(value):
    if isinstance(value, list):
        return value
    if isinstance(value, str):
        try:
            parsed = json.loads(value)
            if isinstance(parsed, list):
                return parsed
        except (json.JSONDecodeError, TypeError):
            pass
    return value


def _parse_bool(value):
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        return value.lower() in ('true', '1', 'yes')
    return bool(value)


def _save_gallery_files(files, upload_to='events/gallery/'):
    urls = []
    for f in files:
        _validate_image_file(f)
        path = default_storage.save(f'{upload_to}{os.path.basename(f.name)}', f)
        urls.append(default_storage.url(path))
    return urls


class EventFAQSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventFAQ
        fields = ['id', 'question', 'answer', 'order', 'translations']


class EventSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    image_file = serializers.ImageField(
        write_only=True,
        required=False,
        source='image',
        validators=[FileExtensionValidator(allowed_extensions=ALLOWED_IMAGE_EXTS)],
    )
    booking_count = serializers.IntegerField(read_only=True, default=0)

    def validate_image_file(self, value):
        return _validate_image_file(value)

    class Meta:
        model = Event
        fields = [
            'id', 'title', 'slug', 'description', 'long_description', 'venue',
            'image', 'image_file', 'event_date', 'base_price', 'currency',
            'category', 'highlights', 'gallery',
            'total_tickets', 'available_tickets', 'is_active', 'is_latest',
            'booking_count', 'translations',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'available_tickets', 'booking_count', 'created_at', 'updated_at']

    def get_image(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

    def _get_absolute_gallery(self, gallery):
        request = self.context.get('request')
        if not request:
            return gallery
        result = []
        for url in gallery:
            if url.startswith('http'):
                result.append(url)
            else:
                result.append(request.build_absolute_uri(url))
        return result

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['gallery'] = self._get_absolute_gallery(instance.gallery or [])
        data['faqs'] = EventFAQSerializer(instance.faqs.all(), many=True).data
        return data

    def validate_highlights(self, value):
        return _parse_json_field(value)

    def validate_gallery(self, value):
        return _parse_json_field(value)

    def validate_is_active(self, value):
        return _parse_bool(value)

    def validate_is_latest(self, value):
        return _parse_bool(value)

    def _handle_gallery_files(self, instance):
        request = self.context.get('request')
        if not request:
            return
        gallery_files = request.FILES.getlist('gallery_files')
        if gallery_files:
            new_urls = _save_gallery_files(gallery_files, 'events/gallery/')
            existing = instance.gallery or []
            instance.gallery = existing + new_urls
            instance.save(update_fields=['gallery'])

    def create(self, validated_data):
        if 'available_tickets' not in validated_data or validated_data['available_tickets'] is None:
            validated_data['available_tickets'] = validated_data.get('total_tickets', 0)
        instance = super().create(validated_data)
        self._handle_gallery_files(instance)
        return instance

    def update(self, instance, validated_data):
        instance = super().update(instance, validated_data)
        self._handle_gallery_files(instance)
        return instance
