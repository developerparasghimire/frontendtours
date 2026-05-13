"""Celery app for Get Tours backend.

Discovered automatically by Django through `config/__init__.py`. Tasks live in
each app under `tasks.py` (e.g. `apps/bookings/tasks.py`).

In production set `REDIS_URL` (auto-set by Heroku Redis) or `CELERY_BROKER_URL`.
Without those, `CELERY_TASK_ALWAYS_EAGER=True` is set in settings so tasks run
synchronously \u2014 the codebase still works without a worker dyno.
"""

from __future__ import annotations

import os

from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

app = Celery("gettours")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()


@app.task(bind=True, ignore_result=True)
def debug_task(self):  # pragma: no cover
    print(f"Request: {self.request!r}")
