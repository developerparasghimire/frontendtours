from rest_framework import serializers
from .models import SiteConfig, ContactSubmission, NewsletterSubscription, AboutStat, Value, Leader, Milestone, PageBanner, Partner

class SiteConfigSerializer(serializers.ModelSerializer):
    logo = serializers.SerializerMethodField()
    logo_dark = serializers.SerializerMethodField()
    footer_logo = serializers.SerializerMethodField()
    home_portfolio_image_1 = serializers.SerializerMethodField()
    home_portfolio_image_2 = serializers.SerializerMethodField()
    home_portfolio_image_3 = serializers.SerializerMethodField()
    home_portfolio_image_4 = serializers.SerializerMethodField()
    home_portfolio_image_5 = serializers.SerializerMethodField()
    
    logo_upload = serializers.ImageField(source='logo', write_only=True, required=False)
    logo_dark_upload = serializers.ImageField(source='logo_dark', write_only=True, required=False)
    footer_logo_upload = serializers.ImageField(source='footer_logo', write_only=True, required=False)
    home_portfolio_image_1_upload = serializers.ImageField(source='home_portfolio_image_1', write_only=True, required=False)
    home_portfolio_image_2_upload = serializers.ImageField(source='home_portfolio_image_2', write_only=True, required=False)
    home_portfolio_image_3_upload = serializers.ImageField(source='home_portfolio_image_3', write_only=True, required=False)
    home_portfolio_image_4_upload = serializers.ImageField(source='home_portfolio_image_4', write_only=True, required=False)
    home_portfolio_image_5_upload = serializers.ImageField(source='home_portfolio_image_5', write_only=True, required=False)
    
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
            'privacy_policy_url', 'terms_of_service_url', 'updated_at'
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
        fields = ['id', 'value', 'label', 'order']


class ValueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Value
        fields = ['id', 'title', 'description', 'icon_svg_path', 'order']


class LeaderSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    image_file = serializers.ImageField(source='image', write_only=True, required=False)

    class Meta:
        model = Leader
        fields = ['id', 'name', 'role', 'bio', 'image', 'image_file', 'category', 'order']

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
        fields = ['id', 'year', 'text', 'order']


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


class PageBannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = PageBanner
        fields = ['id', 'page', 'title', 'subtitle', 'description', 'updated_at']
        read_only_fields = ['id', 'updated_at']
