import logging
import json as _json
import os
from uuid import uuid4

from django.conf import settings
from django.core.mail import EmailMessage
from django.db import connections
from django.db.utils import OperationalError
from django.core.files.storage import default_storage
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger(__name__)
from .models import SiteConfig, ContactSubmission, NewsletterSubscription, AboutStat, Value, Leader, Milestone, EventPopup, PageBanner, Partner, Category
from .serializers import (
    SiteConfigSerializer,
    ContactSubmissionSerializer,
    NewsletterSubscriptionSerializer,
    AboutStatSerializer,
    ValueSerializer,
    LeaderSerializer,
    MilestoneSerializer,
    EventPopupSerializer,
    PageBannerSerializer,
    PartnerSerializer,
    CategorySerializer,
)


@api_view(['GET'])
@permission_classes([AllowAny])
def site_config_view(request):
    """Get site configuration (logo, footer, social media, etc.)"""
    config = SiteConfig.objects.first()
    if not config:
        return Response({})
    serializer = SiteConfigSerializer(config, context={'request': request})
    return Response(serializer.data)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def site_config_update_view(request):
    """Update site configuration — admin only"""
    if not hasattr(request.user, 'role') or request.user.role not in ('SUPER_ADMIN', 'ADMIN'):
        return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

    config = SiteConfig.objects.first()
    if not config:
        config = SiteConfig()

    serializer = SiteConfigSerializer(
        config,
        data=request.data,
        partial=(request.method == 'PATCH'),
        context={'request': request}
    )
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


_CLEARABLE_IMAGE_FIELDS = {f'home_gallery_image_{i}' for i in range(1, 13)} | {
    'logo', 'logo_dark', 'footer_logo',
    *{f'home_portfolio_image_{i}' for i in range(1, 6)},
}

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def site_config_clear_image_view(request):
    """Clear a single image field on SiteConfig."""
    if not hasattr(request.user, 'role') or request.user.role not in ('SUPER_ADMIN', 'ADMIN'):
        return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
    field = request.data.get('field', '')
    if field not in _CLEARABLE_IMAGE_FIELDS:
        return Response({'error': 'Invalid field name.'}, status=status.HTTP_400_BAD_REQUEST)
    cfg, _ = SiteConfig.objects.get_or_create(pk=1)
    setattr(cfg, field, None)
    cfg.save(update_fields=[field])
    return Response({'success': True, 'field': field})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_image_view(request):
    """Upload a single image for use in rich-text editor content."""
    if not hasattr(request.user, 'role') or request.user.role not in ('SUPER_ADMIN', 'ADMIN', 'STAFF'):
        return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

    image = request.FILES.get('image')
    if not image:
        return Response({'error': 'No image provided'}, status=status.HTTP_400_BAD_REQUEST)

    allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    allowed_exts = {'jpg', 'jpeg', 'png', 'gif', 'webp'}
    raw_ext = os.path.splitext(image.name)[-1].lstrip('.').lower()
    if image.content_type not in allowed_types or raw_ext not in allowed_exts:
        return Response({'error': 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP'}, status=status.HTTP_400_BAD_REQUEST)

    if image.size > 10 * 1024 * 1024:  # 10 MB limit
        return Response({'error': 'Image too large (max 10 MB)'}, status=status.HTTP_400_BAD_REQUEST)

    safe_name = f'{uuid4().hex}.{raw_ext}'
    path = default_storage.save(f'editor/{safe_name}', image)
    url = request.build_absolute_uri(default_storage.url(path))
    return Response({'url': url})


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check_view(request):
    """Lightweight health check for uptime monitors and load balancers."""
    database_ok = True
    database_error = None

    try:
        with connections['default'].cursor() as cursor:
            cursor.execute('SELECT 1')
    except OperationalError as exc:
        database_ok = False
        database_error = str(exc)

    payload = {
        'status': 'ok' if database_ok else 'degraded',
        'checks': {
            'api': 'ok',
            'database': 'ok' if database_ok else 'error',
        },
    }

    if database_error:
        logger.error("Health check database error: %s", database_error)

    return Response(
        payload,
        status=status.HTTP_200_OK if database_ok else status.HTTP_503_SERVICE_UNAVAILABLE,
    )


@api_view(['POST'])
@permission_classes([AllowAny])
def contact_submit_view(request):
    """Submit a contact form message"""
    serializer = ContactSubmissionSerializer(data=request.data)
    if serializer.is_valid():
        submission = serializer.save()
        _notify_admins_of_contact(submission)
        return Response({'message': 'Thank you! We will get back to you within 24 hours.'}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


def _notify_admins_of_contact(submission):
    """Email admins when a contact-form submission arrives."""
    recipients = getattr(settings, "BOOKING_NOTIFY_EMAILS", None) or []
    if not recipients:
        fallback = getattr(settings, "DEFAULT_FROM_EMAIL", "")
        recipients = [fallback] if fallback else []
    if not recipients:
        return

    subject = f"[Contact Form] {submission.subject or 'New message'} — {submission.name}"
    body = (
        f"A new contact-form submission was received.\n\n"
        f"Name:    {submission.name}\n"
        f"Email:   {submission.email}\n"
        f"Phone:   {submission.phone or '—'}\n"
        f"Subject: {submission.subject or '—'}\n"
        f"Sent at: {submission.created_at}\n\n"
        f"Message:\n{submission.message}\n"
    )
    try:
        msg = EmailMessage(
            subject=subject,
            body=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=recipients,
            reply_to=[submission.email] if submission.email else None,
        )
        msg.send(fail_silently=True)
    except Exception:
        logger.exception("Failed to send contact-form notification email")


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def contact_list_view(request):
    """List all contact submissions — admin only"""
    if not hasattr(request.user, 'role') or request.user.role not in ('SUPER_ADMIN', 'ADMIN', 'STAFF'):
        return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
    submissions = ContactSubmission.objects.all()
    serializer = ContactSubmissionSerializer(submissions, many=True)
    return Response(serializer.data)


@api_view(['PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def contact_detail_view(request, pk):
    """Mark as read or delete a contact submission — admin only"""
    if not hasattr(request.user, 'role') or request.user.role not in ('SUPER_ADMIN', 'ADMIN', 'STAFF'):
        return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
    try:
        submission = ContactSubmission.objects.get(pk=pk)
    except ContactSubmission.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'DELETE':
        submission.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    submission.is_read = request.data.get('is_read', not submission.is_read)
    submission.save()
    return Response(ContactSubmissionSerializer(submission).data)


@api_view(['POST'])
@permission_classes([AllowAny])
def newsletter_subscribe_view(request):
    """Subscribe an email to the newsletter"""
    serializer = NewsletterSubscriptionSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        obj, created = NewsletterSubscription.objects.get_or_create(email=email)
        if not created:
            obj.is_active = True
            obj.save(update_fields=['is_active'])
        return Response({'message': 'Thank you for subscribing!'}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def newsletter_list_view(request):
    """List all newsletter subscribers — admin only"""
    if not hasattr(request.user, 'role') or request.user.role not in ('SUPER_ADMIN', 'ADMIN', 'STAFF'):
        return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
    subs = NewsletterSubscription.objects.filter(is_active=True)
    return Response([{'email': s.email, 'subscribed_at': s.subscribed_at} for s in subs])


@api_view(['GET'])
@permission_classes([AllowAny])
def about_stats_list_view(request):
    stats = AboutStat.objects.all()
    serializer = AboutStatSerializer(stats, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def about_stat_create_view(request):
    if not hasattr(request.user, 'role') or request.user.role not in ('SUPER_ADMIN', 'ADMIN'):
        return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
    serializer = AboutStatSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def about_stat_detail_view(request, pk):
    if not hasattr(request.user, 'role') or request.user.role not in ('SUPER_ADMIN', 'ADMIN'):
        return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
    try:
        stat = AboutStat.objects.get(pk=pk)
    except AboutStat.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'DELETE':
        stat.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    serializer = AboutStatSerializer(stat, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([AllowAny])
def about_values_list_view(request):
    values = Value.objects.filter(is_active=True)
    serializer = ValueSerializer(values, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def about_value_create_view(request):
    if not hasattr(request.user, 'role') or request.user.role not in ('SUPER_ADMIN', 'ADMIN'):
        return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
    serializer = ValueSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def about_value_detail_view(request, pk):
    if not hasattr(request.user, 'role') or request.user.role not in ('SUPER_ADMIN', 'ADMIN'):
        return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
    try:
        value = Value.objects.get(pk=pk)
    except Value.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'DELETE':
        value.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    serializer = ValueSerializer(value, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([AllowAny])
def about_leaders_list_view(request):
    leaders = Leader.objects.filter(is_active=True)
    serializer = LeaderSerializer(leaders, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def about_leader_create_view(request):
    if not hasattr(request.user, 'role') or request.user.role not in ('SUPER_ADMIN', 'ADMIN'):
        return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
    serializer = LeaderSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def about_leader_detail_view(request, pk):
    if not hasattr(request.user, 'role') or request.user.role not in ('SUPER_ADMIN', 'ADMIN'):
        return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
    try:
        leader = Leader.objects.get(pk=pk)
    except Leader.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'DELETE':
        leader.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    serializer = LeaderSerializer(leader, data=request.data, partial=True, context={'request': request})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([AllowAny])
def about_milestones_list_view(request):
    milestones = Milestone.objects.filter(is_active=True)
    serializer = MilestoneSerializer(milestones, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def about_milestone_create_view(request):
    if not hasattr(request.user, 'role') or request.user.role not in ('SUPER_ADMIN', 'ADMIN'):
        return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
    serializer = MilestoneSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def about_milestone_detail_view(request, pk):
    if not hasattr(request.user, 'role') or request.user.role not in ('SUPER_ADMIN', 'ADMIN'):
        return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
    try:
        milestone = Milestone.objects.get(pk=pk)
    except Milestone.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'DELETE':
        milestone.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    serializer = MilestoneSerializer(milestone, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ─── Page Banners ───────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([AllowAny])
def page_banners_list_view(request):
    """Return all page banners (public)."""
    banners = PageBanner.objects.all()
    serializer = PageBannerSerializer(banners, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def page_banner_by_page_view(request, page):
    """Return banner for a specific page slug (public)."""
    try:
        banner = PageBanner.objects.get(page=page)
    except PageBanner.DoesNotExist:
        return Response({}, status=status.HTTP_200_OK)
    serializer = PageBannerSerializer(banner)
    return Response(serializer.data)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def page_banner_update_view(request, page):
    """Create or update banner for a specific page — admin only."""
    if not hasattr(request.user, 'role') or request.user.role not in ('SUPER_ADMIN', 'ADMIN'):
        return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
    banner, _ = PageBanner.objects.get_or_create(page=page)
    serializer = PageBannerSerializer(banner, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ─── Partners ───────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([AllowAny])
def partners_list_view(request):
    """Return all active partners (public)."""
    partners = Partner.objects.filter(is_active=True)
    serializer = PartnerSerializer(partners, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def partner_create_view(request):
    """Create a new partner — admin only."""
    if not hasattr(request.user, 'role') or request.user.role not in ('SUPER_ADMIN', 'ADMIN'):
        return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
    serializer = PartnerSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def partner_detail_view(request, pk):
    """Get, update, or delete a specific partner — admin only for write operations."""
    try:
        partner = Partner.objects.get(pk=pk)
    except Partner.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = PartnerSerializer(partner, context={'request': request})
        return Response(serializer.data)

    if not hasattr(request.user, 'role') or request.user.role not in ('SUPER_ADMIN', 'ADMIN'):
        return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'DELETE':
        partner.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    serializer = PartnerSerializer(partner, data=request.data, partial=True, context={'request': request})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ──────────────── Categories (Tour & Event taxonomy) ────────────────

def _filter_categories(request):
    qs = Category.objects.all().select_related('parent')
    kind = request.query_params.get('kind')
    parent = request.query_params.get('parent')
    is_active = request.query_params.get('is_active')
    is_featured = request.query_params.get('is_featured')
    if kind:
        qs = qs.filter(kind=kind)
    if parent == 'null':
        qs = qs.filter(parent__isnull=True)
    elif parent:
        try:
            qs = qs.filter(parent_id=int(parent))
        except (TypeError, ValueError):
            pass
    if is_active is not None:
        qs = qs.filter(is_active=is_active.lower() in ('1', 'true', 'yes'))
    if is_featured is not None:
        qs = qs.filter(is_featured=is_featured.lower() in ('1', 'true', 'yes'))
    return qs


@api_view(['GET'])
@permission_classes([AllowAny])
def categories_list_view(request):
    """Public list of categories. Filterable by ?kind=tour|event, ?parent=<id|null>, ?is_active=true, ?is_featured=true.

    Supports ?ordering=-created_at and ?limit=N for the home 'Find Your Adventure' tile.
    """
    qs = _filter_categories(request)
    ordering = request.query_params.get('ordering')
    if ordering:
        # Whitelist allowed ordering fields to avoid injection.
        allowed = {'order', '-order', 'name', '-name', 'created_at', '-created_at'}
        if ordering in allowed:
            qs = qs.order_by(ordering)
    limit = request.query_params.get('limit')
    if limit:
        try:
            n = max(0, int(limit))
            qs = qs[:n]
        except (TypeError, ValueError):
            pass
    serializer = CategorySerializer(qs, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def category_create_view(request):
    if not hasattr(request.user, 'role') or request.user.role not in ('SUPER_ADMIN', 'ADMIN'):
        return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
    serializer = CategorySerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def category_detail_view(request, pk):
    try:
        category = Category.objects.get(pk=pk)
    except Category.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(CategorySerializer(category, context={'request': request}).data)

    if not hasattr(request.user, 'role') or request.user.role not in ('SUPER_ADMIN', 'ADMIN'):
        return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'DELETE':
        category.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    serializer = CategorySerializer(category, data=request.data, partial=True, context={'request': request})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([AllowAny])
def event_popup_view(request):
    """Return the active event popup (public endpoint)."""
    popup = EventPopup.objects.filter(is_active=True).first()
    if not popup:
        return Response(None)
    return Response(EventPopupSerializer(popup, context={'request': request}).data)


@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def event_popup_admin_view(request):
    """Get or update the event popup — admin only."""
    if not hasattr(request.user, 'role') or request.user.role not in ('SUPER_ADMIN', 'ADMIN'):
        return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'GET':
        popup = EventPopup.objects.first()
        if not popup:
            return Response({})
        return Response(EventPopupSerializer(popup, context={'request': request}).data)

    popup, _ = EventPopup.objects.get_or_create(pk=1)
    serializer = EventPopupSerializer(
        popup,
        data=request.data,
        partial=(request.method == 'PATCH'),
        context={'request': request},
    )
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def event_popup_clear_image_view(request):
    """Clear the event popup image."""
    if not hasattr(request.user, 'role') or request.user.role not in ('SUPER_ADMIN', 'ADMIN'):
        return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
    popup, _ = EventPopup.objects.get_or_create(pk=1)
    popup.image = None
    popup.save(update_fields=['image'])
    return Response({'success': True})
