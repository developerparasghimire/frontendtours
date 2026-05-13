"""Celery tasks for the bookings app.

Email sends are wrapped as Celery tasks so a slow SMTP server cannot block the
HTTP request thread (Heroku 30 s router timeout). When `CELERY_TASK_ALWAYS_EAGER`
is True (no broker configured) the task runs synchronously \u2014 callers should
still use `.delay()` so behaviour is uniform across environments.
"""

from __future__ import annotations

import logging

from celery import shared_task

logger = logging.getLogger(__name__)


@shared_task(
    bind=True,
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_backoff_max=300,
    retry_jitter=True,
    max_retries=3,
    ignore_result=True,
    acks_late=True,
)
def send_booking_emails_task(self, booking_type: str, booking_id: int) -> None:
    """Send customer confirmation + admin notification for a confirmed booking.

    Looked up by ID so the task payload stays small and safe to serialise.
    """
    from apps.bookings.email_service import (
        send_admin_booking_notification,
        send_booking_confirmation_email,
    )
    from apps.bookings.models import EventBooking, TourBooking

    Model = TourBooking if booking_type.upper() == "TOUR" else EventBooking
    try:
        booking = Model.objects.select_related().get(id=booking_id)
    except Model.DoesNotExist:
        logger.warning("send_booking_emails_task: booking %s/%s not found", booking_type, booking_id)
        return

    send_booking_confirmation_email(booking_type, booking)
    send_admin_booking_notification(booking_type, booking)
