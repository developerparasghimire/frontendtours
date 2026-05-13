from rest_framework import serializers
from .models import TourBooking, EventBooking
from apps.payments.models import PaymentGateway


class CreateTourBookingSerializer(serializers.Serializer):
    tour_id = serializers.IntegerField(required=True)
    travel_date = serializers.DateField(required=True)
    persons = serializers.IntegerField(min_value=1, max_value=50, required=True)
    gateway = serializers.ChoiceField(
        choices=PaymentGateway.choices, required=False, default=PaymentGateway.MPG
    )
    # Guest fields (optional for authenticated users)
    guest_name = serializers.CharField(max_length=255, required=False, default="", allow_blank=True)
    guest_email = serializers.EmailField(required=False, default="", allow_blank=True)
    guest_phone = serializers.CharField(max_length=30, required=False, default="", allow_blank=True)
    special_requests = serializers.CharField(required=False, default="", allow_blank=True)


class TourBookingSerializer(serializers.ModelSerializer):
    tour_title = serializers.CharField(source='tour.title', read_only=True)
    tour_slug = serializers.CharField(source='tour.slug', read_only=True)
    tour_image = serializers.SerializerMethodField()
    tour_destination = serializers.CharField(source='tour.destination', read_only=True)
    customer_name = serializers.CharField(read_only=True)
    customer_email = serializers.CharField(read_only=True)

    class Meta:
        model = TourBooking
        fields = '__all__'
        read_only_fields = [
            'id', 'booking_reference', 'user', 'total_amount', 'currency',
            'status', 'payment_reference', 'is_refunded', 'created_at', 'updated_at',
        ]

    def get_tour_image(self, obj):
        if obj.tour.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.tour.image.url)
            return obj.tour.image.url
        return None


class CreateEventBookingSerializer(serializers.Serializer):
    event_id = serializers.IntegerField(required=True)
    tickets = serializers.IntegerField(min_value=1, max_value=50, required=True)
    gateway = serializers.ChoiceField(
        choices=PaymentGateway.choices, required=False, default=PaymentGateway.MPG
    )
    # Guest fields (optional for authenticated users)
    guest_name = serializers.CharField(max_length=255, required=False, default="", allow_blank=True)
    guest_email = serializers.EmailField(required=False, default="", allow_blank=True)
    guest_phone = serializers.CharField(max_length=30, required=False, default="", allow_blank=True)
    special_requests = serializers.CharField(required=False, default="", allow_blank=True)


class EventBookingSerializer(serializers.ModelSerializer):
    event_title = serializers.CharField(source='event.title', read_only=True)
    event_slug = serializers.CharField(source='event.slug', read_only=True)
    event_image = serializers.SerializerMethodField()
    event_venue = serializers.CharField(source='event.venue', read_only=True)
    event_date = serializers.DateTimeField(source='event.event_date', read_only=True)
    customer_name = serializers.CharField(read_only=True)
    customer_email = serializers.CharField(read_only=True)

    class Meta:
        model = EventBooking
        fields = '__all__'
        read_only_fields = [
            'id', 'booking_reference', 'user', 'total_amount', 'currency',
            'status', 'payment_reference', 'is_refunded', 'created_at', 'updated_at',
        ]

    def get_event_image(self, obj):
        if obj.event.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.event.image.url)
            return obj.event.image.url
        return None


# ── Admin serializers with nested details ──

class AdminTourBookingSerializer(serializers.ModelSerializer):
    user_email = serializers.SerializerMethodField()
    tour_title = serializers.CharField(source='tour.title', read_only=True)
    customer_name = serializers.CharField(read_only=True)
    customer_email = serializers.CharField(read_only=True)

    class Meta:
        model = TourBooking
        fields = [
            'id', 'booking_reference', 'user', 'user_email', 'tour', 'tour_title',
            'guest_name', 'guest_email', 'guest_phone',
            'customer_name', 'customer_email',
            'travel_date', 'persons', 'total_amount', 'currency',
            'special_requests',
            'status', 'payment_reference', 'is_refunded',
            'created_at', 'updated_at',
        ]

    def get_user_email(self, obj):
        return obj.user.email if obj.user else None


class AdminEventBookingSerializer(serializers.ModelSerializer):
    user_email = serializers.SerializerMethodField()
    event_title = serializers.CharField(source='event.title', read_only=True)
    customer_name = serializers.CharField(read_only=True)
    customer_email = serializers.CharField(read_only=True)

    class Meta:
        model = EventBooking
        fields = [
            'id', 'booking_reference', 'user', 'user_email', 'event', 'event_title',
            'guest_name', 'guest_email', 'guest_phone',
            'customer_name', 'customer_email',
            'tickets', 'total_amount', 'currency',
            'special_requests',
            'status', 'payment_reference', 'is_refunded',
            'created_at', 'updated_at',
        ]

    def get_user_email(self, obj):
        return obj.user.email if obj.user else None
