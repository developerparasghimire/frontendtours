from django.apps import AppConfig


class CommonConfig(AppConfig):
    name = 'apps.common'

    def ready(self):
        # Wire the custom admin "Trigger Deploy" URL into Django's admin site.
        from . import admin_deploy  # noqa: F401
