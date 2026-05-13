from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include

from apps.users.views import GoogleOAuthCallbackView

admin.site.site_header = "Get Tours Admin"
admin.site.site_title = "Get Tours"
admin.site.index_title = "Dashboard"

urlpatterns = [
    path(settings.ADMIN_URL, admin.site.urls),
    # Google OAuth redirect callback (matches redirect URI configured in Google Cloud Console)
    path('api/auth/google/callback/', GoogleOAuthCallbackView.as_view(), name='google_oauth_callback'),
    path('api/v1/users/', include('apps.users.urls')),
    path('api/v1/tours/', include('apps.tours.urls')),
    path('api/v1/events/', include('apps.events.urls')),
    path('api/v1/bookings/', include('apps.bookings.urls')),
    path('api/v1/payments/', include('apps.payments.urls')),
    path('api/v1/common/', include('apps.common.urls')),
    path('api/v1/blog/', include('apps.blog.urls')),
    path('api/v1/testimonials/', include('apps.testimonials.urls')),
    path('api/v1/reviews/', include('apps.reviews.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
