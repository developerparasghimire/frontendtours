import logging
import re

import requests as http_requests
from django.conf import settings
from django.core.mail import send_mail
from django.http import HttpResponseRedirect
from django.utils.html import strip_tags
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import User, EmailVerificationToken, PasswordResetToken, Role
from .serializers import (
    GoogleAuthSerializer,
    LoginSerializer,
    RegisterSerializer,
    UserSerializer,
    ChangePasswordSerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer,
)

logger = logging.getLogger(__name__)

FRONTEND_URL = getattr(settings, "FRONTEND_URL", "http://localhost:3000")
ALLOWED_GOOGLE_ISSUERS = {"accounts.google.com", "https://accounts.google.com"}


def _send_verification_email(user):
    """Create a new token (invalidating old ones) and send verification email."""
    # Mark all previous tokens as used so only the latest link works
    EmailVerificationToken.objects.filter(user=user, is_used=False).update(is_used=True)
    token_obj = EmailVerificationToken.objects.create(user=user)
    verify_url = f"{FRONTEND_URL}/verify-email?token={token_obj.token}"

    subject = "Verify your email — Get Tours Nepal"
    html_message = f"""
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#f9fafb;border-radius:12px;">
        <h2 style="color:#1e293b;margin-bottom:8px;">Welcome to Get Tours Nepal!</h2>
        <p style="color:#475569;">Hi {user.first_name or user.username},</p>
        <p style="color:#475569;">Thank you for registering. Please verify your email to activate your account:</p>
        <a href="{verify_url}"
           style="display:inline-block;margin:20px 0;padding:14px 32px;background:#dc2626;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">
            Verify Email Address
        </a>
        <p style="color:#94a3b8;font-size:13px;">This link expires in 24 hours. If you didn't create an account, ignore this email.</p>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
        <p style="color:#94a3b8;font-size:12px;">Get Tours Nepal — Nepal's #1 Travel Agency</p>
    </div>
    """
    try:
        send_mail(
            subject,
            strip_tags(html_message),
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            html_message=html_message,
            fail_silently=False,
        )
    except Exception as e:
        logger.error(f"[VERIFICATION EMAIL FAILED] user={user.email} error={e}", exc_info=True)


def _send_password_reset_email(user):
    """Create a new reset token (invalidating old ones) and send reset email."""
    PasswordResetToken.objects.filter(user=user, is_used=False).update(is_used=True)
    token_obj = PasswordResetToken.objects.create(user=user)
    reset_url = f"{FRONTEND_URL}/reset-password?token={token_obj.token}"

    subject = "Reset your password — Get Tours Nepal"
    html_message = f"""
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#f9fafb;border-radius:12px;">
        <h2 style="color:#1e293b;margin-bottom:8px;">Password Reset Request</h2>
        <p style="color:#475569;">Hi {user.first_name or user.username},</p>
        <p style="color:#475569;">We received a request to reset your password. Click below to set a new one:</p>
        <a href="{reset_url}"
           style="display:inline-block;margin:20px 0;padding:14px 32px;background:#dc2626;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">
            Reset Password
        </a>
        <p style="color:#94a3b8;font-size:13px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
        <p style="color:#94a3b8;font-size:12px;">Get Tours Nepal — Nepal's #1 Travel Agency</p>
    </div>
    """
    try:
        send_mail(
            subject,
            strip_tags(html_message),
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            html_message=html_message,
            fail_silently=False,
        )
    except Exception as e:
        logger.error(f"[PASSWORD RESET EMAIL FAILED] user={user.email} error={e}", exc_info=True)


def _issue_auth_tokens(user):
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
        "user": UserSerializer(user).data,
    }


def _sanitize_username_candidate(value):
    cleaned = re.sub(r"[^\w.@+-]+", "", value.lower())
    cleaned = cleaned.strip("._-")
    if len(cleaned) < 3:
        cleaned = f"user{cleaned}".strip("._-") or "user"
    return cleaned[:150]


def _build_google_username(email, given_name="", family_name=""):
    name_candidate = ".".join(part for part in [given_name, family_name] if part).strip(".")
    base_candidate = name_candidate or email.split("@", 1)[0]
    base_username = _sanitize_username_candidate(base_candidate)
    username = base_username
    suffix = 1

    while User.objects.filter(username__iexact=username).exists():
        suffix_str = f"-{suffix}"
        username = f"{base_username[:150 - len(suffix_str)]}{suffix_str}"
        suffix += 1

    return username


def verify_google_oauth_token(credential):
    try:
        from google.auth.transport.requests import Request as GoogleRequest
        from google.oauth2 import id_token as google_id_token
    except ImportError as exc:
        raise ValueError("Google sign-in dependencies are not installed on the server yet.") from exc

    allowed_client_ids = getattr(settings, "GOOGLE_OAUTH_CLIENT_IDS", [])
    if not allowed_client_ids:
        raise ValueError("Google sign-in is not configured yet.")

    token_info = google_id_token.verify_oauth2_token(credential, GoogleRequest(), None)

    if token_info.get("iss") not in ALLOWED_GOOGLE_ISSUERS:
        raise ValueError("Invalid Google account issuer.")

    if token_info.get("aud") not in allowed_client_ids:
        raise ValueError("Google sign-in is not allowed for this app.")

    if not token_info.get("email") or not token_info.get("email_verified"):
        raise ValueError("Your Google account must have a verified email address.")

    return token_info


class RegisterView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        _send_verification_email(user)
        return Response(
            {"message": "Registration successful. Please check your email to verify your account."},
            status=status.HTTP_201_CREATED,
        )


class LoginView(TokenObtainPairView):
    permission_classes = [permissions.AllowAny]
    serializer_class = LoginSerializer
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "login"


class GoogleAuthView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "login"

    def post(self, request):
        serializer = GoogleAuthSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            token_info = verify_google_oauth_token(serializer.validated_data["credential"])
        except ValueError as exc:
            return Response({"error": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            logger.exception("Google sign-in failed during token verification.")
            return Response(
                {"error": "Google sign-in failed. Please try again."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        email = token_info["email"].lower().strip()
        given_name = str(token_info.get("given_name", "")).strip()
        family_name = str(token_info.get("family_name", "")).strip()
        user = User.objects.filter(email__iexact=email).first()
        created = False

        if user is None:
            user = User(
                username=_build_google_username(email, given_name=given_name, family_name=family_name),
                email=email,
                first_name=given_name,
                last_name=family_name,
                role=Role.CUSTOMER,
                is_active=True,
                is_email_verified=True,
            )
            user.set_unusable_password()
            user.save()
            created = True
        else:
            is_regular_customer = user.role == Role.CUSTOMER and not user.is_staff and not user.is_superuser
            if not is_regular_customer and not user.is_active:
                return Response(
                    {"error": "This account is inactive. Please contact support."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            updated_fields = []
            if is_regular_customer and not user.is_active:
                user.is_active = True
                updated_fields.append("is_active")
            if is_regular_customer and not user.is_email_verified:
                user.is_email_verified = True
                updated_fields.append("is_email_verified")
            if given_name and not user.first_name:
                user.first_name = given_name
                updated_fields.append("first_name")
            if family_name and not user.last_name:
                user.last_name = family_name
                updated_fields.append("last_name")

            if updated_fields:
                user.save(update_fields=updated_fields)

        return Response(
            {
                **_issue_auth_tokens(user),
                "created": created,
            }
        )


class VerifyEmailView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        token = request.data.get("token")
        if not token:
            return Response({"error": "Token is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            token_obj = EmailVerificationToken.objects.select_related("user").get(token=token)
        except EmailVerificationToken.DoesNotExist:
            return Response({"error": "Invalid verification link."}, status=status.HTTP_400_BAD_REQUEST)

        if not token_obj.is_valid():
            return Response(
                {"error": "This verification link has expired or already been used. Please request a new one."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = token_obj.user
        user.is_active = True
        user.is_email_verified = True
        user.save(update_fields=["is_active", "is_email_verified"])
        token_obj.is_used = True
        token_obj.save(update_fields=["is_used"])
        return Response({"message": "Email verified successfully. You can now log in."})


class ResendVerificationView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email", "").lower().strip()
        if not email:
            return Response({"error": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)

        # Always return success to prevent email enumeration
        try:
            user = User.objects.get(email__iexact=email)
            if not user.is_email_verified:
                _send_verification_email(user)
        except User.DoesNotExist:
            pass

        return Response({"message": "If an account exists with this email, a new verification link has been sent."})


class ForgotPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"].lower().strip()

        # Always return success to prevent email enumeration
        try:
            user = User.objects.get(email__iexact=email, is_active=True)
            _send_password_reset_email(user)
        except User.DoesNotExist:
            pass

        return Response({"message": "If an account exists with this email, a password reset link has been sent."})


class ResetPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        token = serializer.validated_data["token"]
        new_password = serializer.validated_data["new_password"]

        try:
            token_obj = PasswordResetToken.objects.select_related("user").get(token=token)
        except PasswordResetToken.DoesNotExist:
            return Response({"error": "Invalid reset link."}, status=status.HTTP_400_BAD_REQUEST)

        if not token_obj.is_valid():
            if token_obj.is_used:
                return Response(
                    {"error": "Your password has already been reset. Please try logging in with your new password. If you still cannot access your account, request a new reset link."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            return Response(
                {"error": "This reset link has expired. Please request a new password reset link."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = token_obj.user
        user.set_password(new_password)
        user.save(update_fields=["password"])
        token_obj.is_used = True
        token_obj.save(update_fields=["is_used"])
        # Invalidate all other reset tokens for this user
        PasswordResetToken.objects.filter(user=user, is_used=False).update(is_used=True)
        return Response({"message": "Password has been reset successfully. You can now log in."})


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        if not user.check_password(serializer.validated_data["old_password"]):
            return Response({"error": "Current password is incorrect."}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(serializer.validated_data["new_password"])
        user.save(update_fields=["password"])
        return Response({"message": "Password changed successfully."})


class MeView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class GoogleOAuthCallbackView(APIView):
    """
    Handles the traditional OAuth 2.0 redirect flow callback from Google.
    Google redirects here with an authorization code, which this view exchanges
    for an ID token, then processes the same way as GoogleAuthView.
    Finally it redirects the browser back to the frontend with JWT tokens.
    """
    permission_classes = [permissions.AllowAny]

    GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"

    def get(self, request):
        frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:3000")
        error = request.GET.get("error")
        code = request.GET.get("code")

        if error or not code:
            return HttpResponseRedirect(f"{frontend_url}/login?google_error=cancelled")

        client_ids = getattr(settings, "GOOGLE_OAUTH_CLIENT_IDS", [])
        client_secret = getattr(settings, "GOOGLE_OAUTH_CLIENT_SECRET", "")

        if not client_ids or not client_secret:
            logger.error("Google OAuth callback: GOOGLE_OAUTH_CLIENT_IDS or GOOGLE_OAUTH_CLIENT_SECRET not configured.")
            return HttpResponseRedirect(f"{frontend_url}/login?google_error=not_configured")

        redirect_uri = request.build_absolute_uri("/api/auth/google/callback/")

        try:
            token_resp = http_requests.post(
                self.GOOGLE_TOKEN_URL,
                data={
                    "code": code,
                    "client_id": client_ids[0],
                    "client_secret": client_secret,
                    "redirect_uri": redirect_uri,
                    "grant_type": "authorization_code",
                },
                timeout=10,
            )
            token_resp.raise_for_status()
        except Exception:
            logger.exception("Google OAuth callback: failed to exchange authorization code.")
            return HttpResponseRedirect(f"{frontend_url}/login?google_error=token_exchange_failed")

        id_token = token_resp.json().get("id_token")
        if not id_token:
            logger.error("Google OAuth callback: no id_token in token response.")
            return HttpResponseRedirect(f"{frontend_url}/login?google_error=no_id_token")

        try:
            token_info = verify_google_oauth_token(id_token)
        except ValueError as exc:
            logger.warning("Google OAuth callback: token verification failed: %s", exc)
            return HttpResponseRedirect(f"{frontend_url}/login?google_error=verification_failed")
        except Exception:
            logger.exception("Google OAuth callback: unexpected error during token verification.")
            return HttpResponseRedirect(f"{frontend_url}/login?google_error=server_error")

        email = token_info["email"].lower().strip()
        given_name = str(token_info.get("given_name", "")).strip()
        family_name = str(token_info.get("family_name", "")).strip()
        user = User.objects.filter(email__iexact=email).first()

        if user is None:
            user = User(
                username=_build_google_username(email, given_name=given_name, family_name=family_name),
                email=email,
                first_name=given_name,
                last_name=family_name,
                role=Role.CUSTOMER,
                is_active=True,
                is_email_verified=True,
            )
            user.set_unusable_password()
            user.save()
        else:
            is_regular_customer = user.role == Role.CUSTOMER and not user.is_staff and not user.is_superuser
            if not user.is_active and not is_regular_customer:
                return HttpResponseRedirect(f"{frontend_url}/login?google_error=account_inactive")

            updated_fields = []
            if is_regular_customer and not user.is_active:
                user.is_active = True
                updated_fields.append("is_active")
            if is_regular_customer and not user.is_email_verified:
                user.is_email_verified = True
                updated_fields.append("is_email_verified")
            if given_name and not user.first_name:
                user.first_name = given_name
                updated_fields.append("first_name")
            if family_name and not user.last_name:
                user.last_name = family_name
                updated_fields.append("last_name")
            if updated_fields:
                user.save(update_fields=updated_fields)

        tokens = _issue_auth_tokens(user)
        # Redirect to frontend callback page that stores the tokens
        from urllib.parse import urlencode
        params = urlencode({
            "access": tokens["access"],
            "refresh": tokens["refresh"],
        })
        return HttpResponseRedirect(f"{frontend_url}/auth/google/callback?{params}")

