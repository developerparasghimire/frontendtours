"""
Management command: retranslate_all
Re-runs auto_translate on all existing records so every translatable model
gets its translations JSON field populated even if it was saved before the
translation system was added.

Usage:
    python manage.py retranslate_all
"""
from django.core.management.base import BaseCommand
from apps.common.models import SiteConfig, AboutStat, Value, Leader, Milestone, Category, EventPopup, PageBanner
from apps.tours.models import Tour, TourFAQ, TourGuide
from apps.events.models import Event
from apps.blog.models import BlogPost
from apps.common.translation_utils import auto_translate


class Command(BaseCommand):
    help = "Re-generate auto-translations for all existing translatable records"

    def handle(self, *args, **options):
        self._retranslate_siteconfig()
        self._retranslate_aboutstats()
        self._retranslate_values()
        self._retranslate_leaders()
        self._retranslate_milestones()
        self._retranslate_categories()
        self._retranslate_eventpopups()
        self._retranslate_pagebanners()
        self._retranslate_tours()
        self._retranslate_tourfaqs()
        self._retranslate_tourguides()
        self._retranslate_events()
        self._retranslate_blogposts()
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

    def _retranslate_categories(self):
        qs = Category.objects.all()
        self.stdout.write(f"  Category: {qs.count()} records…")
        for obj in qs:
            fields = {k: v for k, v in {"name": obj.name, "description": obj.description or ""}.items() if v}
            if not fields:
                continue
            translations = auto_translate(fields)
            Category.objects.filter(pk=obj.pk).update(translations=translations)
        self.stdout.write(self.style.SUCCESS("  Category: done."))

    def _retranslate_eventpopups(self):
        qs = EventPopup.objects.all()
        self.stdout.write(f"  EventPopup: {qs.count()} records…")
        for obj in qs:
            fields = {k: v for k, v in {"title": obj.title or "", "button_text": obj.button_text or ""}.items() if v}
            if not fields:
                continue
            translations = auto_translate(fields)
            EventPopup.objects.filter(pk=obj.pk).update(translations=translations)
        self.stdout.write(self.style.SUCCESS("  EventPopup: done."))

    def _retranslate_pagebanners(self):
        qs = PageBanner.objects.all()
        self.stdout.write(f"  PageBanner: {qs.count()} records…")
        for obj in qs:
            fields = {k: v for k, v in {
                "title": obj.title or "", "subtitle": obj.subtitle or "", "description": obj.description or ""
            }.items() if v}
            if not fields:
                continue
            translations = auto_translate(fields)
            PageBanner.objects.filter(pk=obj.pk).update(translations=translations)
        self.stdout.write(self.style.SUCCESS("  PageBanner: done."))

    def _retranslate_tours(self):
        qs = Tour.objects.all()
        self.stdout.write(f"  Tour: {qs.count()} records…")
        for obj in qs:
            highlights_str = "\n".join(obj.highlights) if obj.highlights else ""
            includes_str = "\n".join(obj.includes) if obj.includes else ""
            fields = {k: v for k, v in {
                "title": obj.title or "",
                "description": obj.description or "",
                "long_description": obj.long_description or "",
                "badge": obj.badge or "",
                "best_season": obj.best_season or "",
                "destination": obj.destination or "",
                "highlights": highlights_str,
                "includes": includes_str,
            }.items() if v}
            if not fields:
                continue
            translations = auto_translate(fields)
            Tour.objects.filter(pk=obj.pk).update(translations=translations)
        self.stdout.write(self.style.SUCCESS("  Tour: done."))

    def _retranslate_tourfaqs(self):
        qs = TourFAQ.objects.all()
        self.stdout.write(f"  TourFAQ: {qs.count()} records…")
        for obj in qs:
            fields = {k: v for k, v in {"question": obj.question or "", "answer": obj.answer or ""}.items() if v}
            if not fields:
                continue
            translations = auto_translate(fields)
            TourFAQ.objects.filter(pk=obj.pk).update(translations=translations)
        self.stdout.write(self.style.SUCCESS("  TourFAQ: done."))

    def _retranslate_tourguides(self):
        qs = TourGuide.objects.all()
        self.stdout.write(f"  TourGuide: {qs.count()} records…")
        for obj in qs:
            if not obj.bio:
                continue
            translations = auto_translate({"bio": obj.bio})
            TourGuide.objects.filter(pk=obj.pk).update(translations=translations)
        self.stdout.write(self.style.SUCCESS("  TourGuide: done."))

    def _retranslate_events(self):
        qs = Event.objects.all()
        self.stdout.write(f"  Event: {qs.count()} records…")
        for obj in qs:
            highlights_str = "\n".join(obj.highlights) if obj.highlights else ""
            fields = {k: v for k, v in {
                "title": obj.title or "",
                "description": obj.description or "",
                "long_description": obj.long_description or "",
                "venue": obj.venue or "",
                "highlights": highlights_str,
            }.items() if v}
            if not fields:
                continue
            translations = auto_translate(fields)
            Event.objects.filter(pk=obj.pk).update(translations=translations)
        self.stdout.write(self.style.SUCCESS("  Event: done."))

    def _retranslate_blogposts(self):
        qs = BlogPost.objects.all()
        self.stdout.write(f"  BlogPost: {qs.count()} records…")
        for obj in qs:
            fields = {k: v for k, v in {
                "title": obj.title or "",
                "excerpt": obj.excerpt or "",
                "content": obj.content or "",
                "category": obj.category or "",
                "read_time": obj.read_time or "",
            }.items() if v}
            if not fields:
                continue
            translations = auto_translate(fields)
            BlogPost.objects.filter(pk=obj.pk).update(translations=translations)
        self.stdout.write(self.style.SUCCESS("  BlogPost: done."))
