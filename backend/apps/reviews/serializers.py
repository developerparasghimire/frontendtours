from rest_framework import serializers
from .models import Review


class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    user_email = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = [
            "id", "user", "user_name", "user_email",
            "tour", "event", "rating", "comment",
            "is_verified_booking", "is_approved", "created_at",
        ]
        read_only_fields = ["id", "user", "is_verified_booking", "is_approved", "created_at"]

    def get_user_name(self, obj):
        u = obj.user
        full = f"{u.first_name} {u.last_name}".strip()
        return full or u.username

    def get_user_email(self, obj):
        return obj.user.email


class CreateReviewSerializer(serializers.Serializer):
    tour_id = serializers.IntegerField(required=False)
    event_id = serializers.IntegerField(required=False)
    rating = serializers.IntegerField(min_value=1, max_value=5)
    comment = serializers.CharField(max_length=2000)

    def validate(self, data):
        tour_id = data.get("tour_id")
        event_id = data.get("event_id")
        if not tour_id and not event_id:
            raise serializers.ValidationError("Either tour_id or event_id is required.")
        if tour_id and event_id:
            raise serializers.ValidationError("Provide only one of tour_id or event_id, not both.")
        return data
