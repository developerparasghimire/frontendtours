from rest_framework import serializers
from .models import SiteConfig, ContactSubmission, NewsletterSubscription, AboutStat, Value, Leader, Milestone, EventPopup, PageBanner, Partner, Category

class SiteConfigSerializer(serializers.ModelSerializer):
    logo = serializers.SerializerMethodField()
    logo_dark = serializers.SerializerMethodField()
    footer_logo = serializers.SerializerMethodField()
    home_portfolio_image_1 = serializers.SerializerMethodField()
    home_portfolio_image_2 = serializers.SerializerMethodField()
    home_portfolio_image_3 = serializers.SerializerMethodField()
    home_portfolio_image_4 = serializers.SerializerMethodField()
    home_portfolio_image_5 = serializers.SerializerMethodField()
    home_gallery_image_1 = serializers.SerializerMethodField()
    home_gallery_image_2 = serializers.SerializerMethodField()
    home_gallery_image_3 = serializers.SerializerMethodField()
    home_gallery_image_4 = serializers.SerializerMethodField()
    home_gallery_image_5 = serializers.SerializerMethodField()
    home_gallery_image_6 = serializers.SerializerMethodField()
    home_gallery_image_7 = serializers.SerializerMethodField()
    home_gallery_image_8 = serializers.SerializerMethodField()
    home_gallery_image_9 = serializers.SerializerMethodField()
    home_gallery_image_10 = serializers.SerializerMethodField()
    home_gallery_image_11 = serializers.SerializerMethodField()
    home_gallery_image_12 = serializers.SerializerMethodField()

    logo_upload = serializers.ImageField(source='logo', write_only=True, required=False)
    logo_dark_upload = serializers.ImageField(source='logo_dark', write_only=True, required=False)
    footer_logo_upload = serializers.ImageField(source='footer_logo', write_only=True, required=False)
    home_portfolio_image_1_upload = serializers.ImageField(source='home_portfolio_image_1', write_only=True, required=False)
    home_portfolio_image_2_upload = serializers.ImageField(source='home_portfolio_image_2', write_only=True, required=False)
    home_portfolio_image_3_upload = serializers.ImageField(source='home_portfolio_image_3', write_only=True, required=False)
    home_portfolio_image_4_upload = serializers.ImageField(source='home_portfolio_image_4', write_only=True, required=False)
    home_portfolio_image_5_upload = serializers.ImageField(source='home_portfolio_image_5', write_only=True, required=False)
    home_gallery_image_1_upload = serializers.ImageField(source='home_gallery_image_1', write_only=True, required=False)
    home_gallery_image_2_upload = serializers.ImageField(source='home_gallery_image_2', write_only=True, required=False)
    home_gallery_image_3_upload = serializers.ImageField(source='home_gallery_image_3', write_only=True, required=False)
    home_gallery_image_4_upload = serializers.ImageField(source='home_gallery_image_4', write_only=True, required=False)
    home_gallery_image_5_upload = serializers.ImageField(source='home_gallery_image_5', write_only=True, required=False)
    home_gallery_image_6_upload = serializers.ImageField(source='home_gallery_image_6', write_only=True, required=False)
    home_gallery_image_7_upload = serializers.ImageField(source='home_gallery_image_7', write_only=True, required=False)
    home_gallery_image_8_upload = serializers.ImageField(source='home_gallery_image_8', write_only=True, required=False)
    home_gallery_image_9_upload = serializers.ImageField(source='home_gallery_image_9', write_only=True, required=False)
    home_gallery_image_10_upload = serializers.ImageField(source='home_gallery_image_10', write_only=True, required=False)
    home_gallery_image_11_upload = serializers.ImageField(source='home_gallery_image_11', write_only=True, required=False)
    home_gallery_image_12_upload = serializers.ImageField(source='home_gallery_image_12', write_only=True, required=False)

    class Meta:
        model = SiteConfig
        fields = [
            'site_name', 'site_tagline', 'site_description',
            'logo', 'logo_dark', 'footer_logo',
            'logo_upload', 'logo_dark_upload', 'footer_logo_upload',
            'footer_text', 'phone', 'email', 'address', 'google_map_url',
            'facebook_url', 'twitter_url', 'instagram_url',
            'linkedin_url', 'youtube_url', 'tiktok_url',
            'home_portfolio_link_label', 'home_portfolio_link_url',
            'home_portfolio_image_1', 'home_portfolio_image_2', 'home_portfolio_image_3',
            'home_portfolio_image_4', 'home_portfolio_image_5',
            'home_portfolio_image_1_upload', 'home_portfolio_image_2_upload', 'home_portfolio_image_3_upload',
            'home_portfolio_image_4_upload', 'home_portfolio_image_5_upload',
            'home_gallery_image_1', 'home_gallery_image_2', 'home_gallery_image_3', 'home_gallery_image_4',
            'home_gallery_image_5', 'home_gallery_image_6', 'home_gallery_image_7', 'home_gallery_image_8',
            'home_gallery_image_9', 'home_gallery_image_10', 'home_gallery_image_11', 'home_gallery_image_12',
            'home_gallery_image_1_upload', 'home_gallery_image_2_upload', 'home_gallery_image_3_upload',
            'home_gallery_image_4_upload', 'home_gallery_image_5_upload', 'home_gallery_image_6_upload',
            'home_gallery_image_7_upload', 'home_gallery_image_8_upload',
            'home_gallery_image_9_upload', 'home_gallery_image_10_upload',
            'home_gallery_image_11_upload', 'home_gallery_image_12_upload',
            'home_about_heading', 'home_about_eyebrow', 'home_about_paragraph_1', 'home_about_paragraph_2',
            'about_eyebrow', 'about_title', 'about_paragraph_1', 'about_paragraph_2',
            'privacy_policy_url', 'terms_of_service_url', 'translations', 'updated_at'
        ]
        read_only_fields = ['updated_at']
    
    def _get_image_url(self, image_field):
        if image_field:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(image_field.url)
            return image_field.url
        return None
    
    def get_logo(self, obj):
        return self._get_image_url(obj.logo)
    
    def get_logo_dark(self, obj):
        return self._get_image_url(obj.logo_dark)
    
    def get_footer_logo(self, obj):
        return self._get_image_url(obj.footer_logo)

    def get_home_portfolio_image_1(self, obj):
        return self._get_image_url(obj.home_portfolio_image_1)

    def get_home_portfolio_image_2(self, obj):
        return self._get_image_url(obj.home_portfolio_image_2)

    def get_home_portfolio_image_3(self, obj):
        return self._get_image_url(obj.home_portfolio_image_3)

    def get_home_portfolio_image_4(self, obj):
        return self._get_image_url(obj.home_portfolio_image_4)

    def get_home_portfolio_image_5(self, obj):
        return self._get_image_url(obj.home_portfolio_image_5)

    def get_home_gallery_image_1(self, obj): return self._get_image_url(obj.home_gallery_image_1)
    def get_home_gallery_image_2(self, obj): return self._get_image_url(obj.home_gallery_image_2)
    def get_home_gallery_image_3(self, obj): return self._get_image_url(obj.home_gallery_image_3)
    def get_home_gallery_image_4(self, obj): return self._get_image_url(obj.home_gallery_image_4)
    def get_home_gallery_image_5(self, obj): return self._get_image_url(obj.home_gallery_image_5)
    def get_home_gallery_image_6(self, obj): return self._get_image_url(obj.home_gallery_image_6)
    def get_home_gallery_image_7(self, obj): return self._get_image_url(obj.home_gallery_image_7)
    def get_home_gallery_image_8(self, obj): return self._get_image_url(obj.home_gallery_image_8)
    def get_home_gallery_image_9(self, obj): return self._get_image_url(obj.home_gallery_image_9)
    def get_home_gallery_image_10(self, obj): return self._get_image_url(obj.home_gallery_image_10)
    def get_home_gallery_image_11(self, obj): return self._get_image_url(obj.home_gallery_image_11)
    def get_home_gallery_image_12(self, obj): return self._get_image_url(obj.home_gallery_image_12)


class ContactSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactSubmission
        fields = ['id', 'name', 'email', 'phone', 'subject', 'message', 'is_read', 'created_at']
        read_only_fields = ['id', 'is_read', 'created_at']


class NewsletterSubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsletterSubscription
        fields = ['email']

    def validate_email(self, value):
        return value.lower().strip()


class AboutStatSerializer(serializers.ModelSerializer):
    class Meta:
        model = AboutStat
        fields = ['id', 'value', 'label', 'order', 'translations']


class ValueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Value
        fields = ['id', 'title', 'description', 'icon_svg_path', 'order', 'translations']


class LeaderSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    image_file = serializers.ImageField(source='image', write_only=True, required=False)

    class Meta:
        model = Leader
        fields = ['id', 'name', 'role', 'bio', 'image', 'image_file', 'category', 'order', 'translations']

    def get_image(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class MilestoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Milestone
        fields = ['id', 'year', 'text', 'order', 'translations']


class PartnerSerializer(serializers.ModelSerializer):
    logo = serializers.SerializerMethodField()
    logo_file = serializers.ImageField(source='logo', write_only=True, required=False)

    class Meta:
        model = Partner
        fields = ['id', 'name', 'logo', 'logo_file', 'website_url', 'order', 'is_active']

    def get_logo(self, obj):
        if obj.logo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.logo.url)
            return obj.logo.url
        return None


def _validate_upload_size(value, max_mb=5):
    if hasattr(value, 'size') and value.size > max_mb * 1024 * 1024:
        raise serializers.ValidationError(f"Image too large (max {max_mb} MB).")
    return value


class EventPopupSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    image_file = serializers.ImageField(source='image', write_only=True, required=False)

    def validate_image_file(self, value):
        return _validate_upload_size(value)

    class Meta:
        model = EventPopup
        fields = ['id', 'title', 'image', 'image_file', 'button_text', 'button_url', 'is_active', 'translations', 'updated_at']
        read_only_fields = ['id', 'updated_at']

    def get_image(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class PageBannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = PageBanner
        fields = ['id', 'page', 'title', 'subtitle', 'description', 'translations', 'updated_at']


class CategorySerializer(serializers.ModelSerializer):
    parent_name = serializers.CharField(source='parent.name', read_only=True, default=None)
    image = serializers.SerializerMethodField()
    image_file = serializers.ImageField(source='image', write_only=True, required=False)

    class Meta:
        model = Category
        fields = [
            'id', 'kind', 'name', 'parent', 'parent_name',
            'icon', 'image', 'image_file', 'description',
            'is_featured', 'order', 'is_active', 'translations',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'parent_name', 'created_at', 'updated_at']

    def get_image(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

    def validate(self, attrs):
        kind = attrs.get('kind') or getattr(self.instance, 'kind', None)
        parent = attrs.get('parent') if 'parent' in attrs else getattr(self.instance, 'parent', None)
        if parent is not None:
            if parent.parent_id is not None:
                raise serializers.ValidationError({'parent': 'Sub-categories cannot be nested further.'})
            if kind and parent.kind != kind:
                raise serializers.ValidationError({'parent': 'Parent category must have the same kind.'})
        # Prevent self-parenting on update.
        if self.instance and parent and parent.pk == self.instance.pk:
            raise serializers.ValidationError({'parent': 'A category cannot be its own parent.'})
        return attrs
        read_only_fields = ['id', 'updated_at']
