"""
Management command: retranslate_all
Re-runs auto_translate on all existing records so every translatable model
gets its translations JSON field populated even if it was saved before the
translation system was added.

Usage:
    python manage.py retranslate_all
"""
from django.core.management.base import BaseCommand
from apps.common.models import SiteConfig, AboutStat, Value, Leader, Milestone
from apps.common.translation_utils import auto_translate


class Command(BaseCommand):
    help = "Re-generate auto-translations for all existing translatable records"

    def handle(self, *args, **options):
        self._retranslate_siteconfig()
        self._retranslate_aboutstats()
        self._retranslate_values()
        self._retranslate_leaders()
        self._retranslate_milestones()
        self.stdout.write(self.style.SUCCESS("✅ All translations regenerated."))

    def _retranslate_siteconfig(self):
        cfg = SiteConfig.objects.first()
        if not cfg:
            self.stdout.write("  SiteConfig: no record found, skipping.")
            return
        fields = {
            "home_about_heading": cfg.home_about_heading or "",
            "home_about_eyebrow": cfg.home_about_eyebrow or "",
            "home_about_paragraph_1": cfg.home_about_paragraph_1 or "",
            "home_about_paragraph_2": cfg.home_about_paragraph_2 or "",
            "about_eyebrow": cfg.about_eyebrow or "",
            "about_title": cfg.about_title or "",
            "about_paragraph_1": cfg.about_paragraph_1 or "",
            "about_paragraph_2": cfg.about_paragraph_2 or "",
        }
        fields = {k: v for k, v in fields.items() if v.strip()}
        if not fields:
            self.stdout.write("  SiteConfig: no text fields to translate.")
            return
        self.stdout.write("  SiteConfig: translating…")
        translations = auto_translate(fields)
        SiteConfig.objects.filter(pk=cfg.pk).update(translations=translations)
        self.stdout.write(self.style.SUCCESS("  SiteConfig: done."))

    def _retranslate_aboutstats(self):
        qs = AboutStat.objects.all()
        self.stdout.write(f"  AboutStat: {qs.count()} records…")
        for obj in qs:
            if not obj.label:
                continue
            translations = auto_translate({"label": obj.label})
            AboutStat.objects.filter(pk=obj.pk).update(translations=translations)
        self.stdout.write(self.style.SUCCESS("  AboutStat: done."))

    def _retranslate_values(self):
        qs = Value.objects.all()
        self.stdout.write(f"  Value: {qs.count()} records…")
        for obj in qs:
            fields = {k: v for k, v in {"title": obj.title, "description": obj.description}.items() if v}
            if not fields:
                continue
            translations = auto_translate(fields)
            Value.objects.filter(pk=obj.pk).update(translations=translations)
        self.stdout.write(self.style.SUCCESS("  Value: done."))

    def _retranslate_leaders(self):
        qs = Leader.objects.all()
        self.stdout.write(f"  Leader: {qs.count()} records…")
        for obj in qs:
            fields = {k: v for k, v in {"role": obj.role, "bio": obj.bio}.items() if v}
            if not fields:
                continue
            translations = auto_translate(fields)
            Leader.objects.filter(pk=obj.pk).update(translations=translations)
        self.stdout.write(self.style.SUCCESS("  Leader: done."))

    def _retranslate_milestones(self):
        qs = Milestone.objects.all()
        self.stdout.write(f"  Milestone: {qs.count()} records…")
        for obj in qs:
            if not obj.text:
                continue
            translations = auto_translate({"text": obj.text})
            Milestone.objects.filter(pk=obj.pk).update(translations=translations)
        self.stdout.write(self.style.SUCCESS("  Milestone: done."))
