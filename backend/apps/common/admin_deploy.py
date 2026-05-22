"""Admin-panel 'Trigger Deploy' page.

Adds a custom URL under the Django admin (e.g. /gettoursadmin/deploy/) that lets a
logged-in superuser fire the Vercel / Heroku / GitHub deploy hooks defined in
settings (VERCEL_DEPLOY_HOOK_URL, HEROKU_DEPLOY_HOOK_URL, GITHUB_DEPLOY_HOOK_URL).

Why this design (security):
* Hook URLs are bearer credentials. They live in env vars on the server only —
  never in the DB, never exposed to the browser.
* Only superusers can access this view. We also re-check is_active.
* CSRF is enforced by Django admin's session auth.
"""
from django.conf import settings
from django.contrib import admin, messages
from django.contrib.admin.views.decorators import staff_member_required
from django.http import HttpResponseRedirect
from django.shortcuts import render
from django.urls import path, reverse
from django.views.decorators.http import require_http_methods

from .views import _trigger_deploy_hook


def _is_superuser(user):
    return user.is_authenticated and user.is_active and user.is_superuser


@staff_member_required
@require_http_methods(["GET", "POST"])
def deploy_admin_view(request):
    if not _is_superuser(request.user):
        messages.error(request, "Only superusers can trigger deployments.")
        return HttpResponseRedirect(reverse('admin:index'))

    targets = {
        'vercel': getattr(settings, 'VERCEL_DEPLOY_HOOK_URL', '') or '',
        'heroku': getattr(settings, 'HEROKU_DEPLOY_HOOK_URL', '') or '',
        'github': getattr(settings, 'GITHUB_DEPLOY_HOOK_URL', '') or '',
    }
    configured = {k: bool(v) for k, v in targets.items()}
    results = None

    if request.method == 'POST':
        chosen = [t for t in request.POST.getlist('targets') if t in targets]
        if not chosen:
            messages.warning(request, "Select at least one target to deploy.")
        else:
            results = {}
            for name in chosen:
                ok, code, msg = _trigger_deploy_hook(targets.get(name, ''))
                results[name] = {'ok': ok, 'status': code, 'message': msg}
                if ok:
                    messages.success(request, f"{name.title()} deploy triggered (HTTP {code}).")
                else:
                    messages.error(request, f"{name.title()} failed (HTTP {code}): {msg}")

    context = {
        **admin.site.each_context(request),
        'title': 'Trigger Deployment',
        'configured': configured,
        'results': results,
        'has_any_configured': any(configured.values()),
    }
    return render(request, 'admin/deploy.html', context)


# Patch admin.site.get_urls to expose our custom view.
_original_get_urls = admin.site.get_urls


def _patched_get_urls():
    urls = _original_get_urls()
    custom = [
        path('deploy/', admin.site.admin_view(deploy_admin_view), name='deploy'),
    ]
    return custom + urls


admin.site.get_urls = _patched_get_urls
