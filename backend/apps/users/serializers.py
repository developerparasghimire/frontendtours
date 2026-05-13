import re
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Role, User


PASSWORD_SPECIAL_RE = re.compile(r'[!@#$%^&*(),.?":{}|<>]')


def validate_strong_password(value):
    if not re.search(r'[A-Z]', value):
        raise serializers.ValidationError("Password must contain at least one uppercase letter.")
    if not re.search(r'[a-z]', value):
        raise serializers.ValidationError("Password must contain at least one lowercase letter.")
    if not re.search(r'\d', value):
        raise serializers.ValidationError("Password must contain at least one digit.")
    if not PASSWORD_SPECIAL_RE.search(value):
        raise serializers.ValidationError("Password must contain at least one special character.")
    validate_password(value)
    return value


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'first_name', 'last_name', 'is_email_verified']
        read_only_fields = ['id', 'role', 'is_email_verified']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True, min_length=8, required=False)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'first_name', 'last_name']

    def validate_username(self, value):
        value = value.strip()
        if len(value) < 3:
            raise serializers.ValidationError("Username must be at least 3 characters long.")
        if not re.fullmatch(r'[\w.@+-]+', value):
            raise serializers.ValidationError("Username can only contain letters, numbers, and @/./+/-/_ characters.")
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("An account with this username already exists.")
        return value

    def validate_email(self, value):
        value = value.lower().strip()
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value

    def validate_password(self, value):
        return validate_strong_password(value)

    def validate(self, attrs):
        password2 = attrs.pop("password2", None)
        if password2 is not None and attrs["password"] != password2:
            raise serializers.ValidationError({"password2": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        user.is_active = False  # Inactive until email verified
        user.is_email_verified = False
        user.save(update_fields=['is_active', 'is_email_verified'])
        return user


class LoginSerializer(TokenObtainPairSerializer):
    default_error_messages = {
        "no_active_account": "Invalid email or password.",
        "email_not_verified": "Please verify your email before logging in.",
        "inactive_account": "This account is inactive. Please contact support.",
    }

    def validate(self, attrs):
        email = str(attrs.get(self.username_field, "")).lower().strip()
        password = attrs.get("password", "")

        user = User.objects.filter(email__iexact=email).first()
        if not user or not password or not user.check_password(password):
            raise AuthenticationFailed(self.error_messages["no_active_account"], code="authorization")

        is_regular_customer = user.role == Role.CUSTOMER and not user.is_staff and not user.is_superuser
        if is_regular_customer and not user.is_email_verified:
            raise AuthenticationFailed(self.error_messages["email_not_verified"], code="email_not_verified")

        if not user.is_active:
            raise AuthenticationFailed(self.error_messages["inactive_account"], code="inactive_account")

        self.user = user
        refresh = self.get_token(user)
        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": UserSerializer(user).data,
        }


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=8)

    def validate_new_password(self, value):
        return validate_strong_password(value)


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)


class ResetPasswordSerializer(serializers.Serializer):
    token = serializers.UUIDField(required=True)
    new_password = serializers.CharField(required=True, min_length=8)

    def validate_new_password(self, value):
        return validate_strong_password(value)


class GoogleAuthSerializer(serializers.Serializer):
    credential = serializers.CharField(required=True, trim_whitespace=True)
