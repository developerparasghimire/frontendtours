"""
Booking email sending.

`send_mail` here is invoked from Celery tasks (apps/bookings/tasks.py) so the
request thread is never blocked by SMTP latency.  Each function tolerates
failure cleanly: a logged exception is preferred over a 500 response.

If Celery isn't configured at all, settings.CELERY_TASK_ALWAYS_EAGER is True
and the task runs synchronously — still safe because both helpers below
swallow exceptions internally.
"""

import logging

from django.conf import settings
from django.core.mail import send_mail
from django.utils.html import strip_tags

logger = logging.getLogger("bookings")

FRONTEND_URL = getattr(settings, "FRONTEND_URL", "http://localhost:3000")


def _safe_send(subject: str, plain_body: str, recipients: list[str], html_body: str | None = None) -> None:
    """Send a single mail, never raise."""
    if not recipients:
        logger.warning("_safe_send called with no recipients")
        return
    try:
        send_mail(
            subject,
            plain_body,
            settings.DEFAULT_FROM_EMAIL,
            recipients,
            html_message=html_body,
            fail_silently=False,
        )
        logger.info("Email sent: %r to %s", subject, recipients)
    except Exception:
        # Never propagate — caller is usually a paid checkout return path.
        logger.exception("Failed to send email %r to %s", subject, recipients)


def queue_booking_emails(booking_type: str, booking) -> None:
    """Send customer confirmation + admin notification emails synchronously."""
    send_booking_confirmation_email(booking_type, booking)
    send_admin_booking_notification(booking_type, booking)


def send_booking_confirmation_email(booking_type: str, booking) -> None:
    """
    Send a booking confirmation email to the customer.

    Args:
        booking_type: 'TOUR' or 'EVENT'
        booking: TourBooking or EventBooking instance (already CONFIRMED)
    """
    email = booking.customer_email
    name = booking.customer_name or "Valued Customer"

    if not email:
        logger.warning(
            "No email address for booking %s — skipping confirmation email.",
            booking.booking_reference,
        )
        return

    if booking_type.upper() == "TOUR":
        item_title = booking.tour.title
        item_type_label = "Tour Package"
        qty_label = f"{booking.persons} {'person' if booking.persons == 1 else 'persons'}"
        date_label = str(booking.travel_date)
    else:
        item_title = booking.event.title
        item_type_label = "Event Ticket"
        qty_label = f"{booking.tickets} {'ticket' if booking.tickets == 1 else 'tickets'}"
        dt = booking.event.event_date
        date_label = dt.strftime("%d %b %Y, %I:%M %p") if hasattr(dt, "strftime") else str(dt)

    subject = f"Booking Confirmed! {booking.booking_reference} — Get Tours Nepal"
    receipt_url = f"{FRONTEND_URL}/payment/success?ref={booking.booking_reference}"

    html_message = f"""
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9fafb;padding:0;">
      <!-- Header -->
      <div style="background:#dc2626;padding:32px 40px;border-radius:12px 12px 0 0;text-align:center;">
        <h1 style="color:white;margin:0;font-size:26px;font-weight:900;">Get Tours Nepal</h1>
        <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:13px;">Nepal's #1 Travel Agency</p>
      </div>

      <!-- Success Banner -->
      <div style="background:#16a34a;padding:16px 40px;text-align:center;">
        <p style="color:white;margin:0;font-size:17px;font-weight:700;">&#10003; Your booking is confirmed!</p>
      </div>

      <!-- Body -->
      <div style="background:white;padding:36px 40px;border-radius:0 0 12px 12px;">
        <p style="color:#334155;margin:0 0 20px;font-size:15px;">Hi <strong>{name}</strong>,</p>
        <p style="color:#475569;margin:0 0 24px;font-size:14px;line-height:1.6;">
          Thank you for booking with Get Tours Nepal! Your payment was successful and your booking is confirmed.
          Please keep this email as your receipt.
        </p>

        <!-- Booking Reference Box -->
        <div style="background:#f1f5f9;border-radius:10px;padding:20px;text-align:center;margin-bottom:28px;">
          <p style="color:#64748b;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;margin:0 0 8px;">Booking Reference</p>
          <p style="color:#dc2626;font-size:30px;font-weight:900;margin:0;letter-spacing:0.06em;font-family:monospace;">{booking.booking_reference}</p>
        </div>

        <!-- Booking Summary Table -->
        <table style="width:100%;border-collapse:collapse;margin-bottom:28px;font-size:14px;">
          <tr>
            <td style="padding:11px 14px;background:#f8fafc;border-bottom:1px solid #e2e8f0;color:#64748b;font-weight:600;width:38%;">{item_type_label}</td>
            <td style="padding:11px 14px;background:#f8fafc;border-bottom:1px solid #e2e8f0;color:#1e293b;font-weight:700;">{item_title}</td>
          </tr>
          <tr>
            <td style="padding:11px 14px;border-bottom:1px solid #e2e8f0;color:#64748b;font-weight:600;">Date</td>
            <td style="padding:11px 14px;border-bottom:1px solid #e2e8f0;color:#1e293b;">{date_label}</td>
          </tr>
          <tr>
            <td style="padding:11px 14px;background:#f8fafc;border-bottom:1px solid #e2e8f0;color:#64748b;font-weight:600;">Quantity</td>
            <td style="padding:11px 14px;background:#f8fafc;border-bottom:1px solid #e2e8f0;color:#1e293b;">{qty_label}</td>
          </tr>
          <tr>
            <td style="padding:11px 14px;border-bottom:1px solid #e2e8f0;color:#64748b;font-weight:600;">Total Paid</td>
            <td style="padding:11px 14px;border-bottom:1px solid #e2e8f0;color:#16a34a;font-weight:700;">{booking.currency} {booking.total_amount}</td>
          </tr>
          <tr>
            <td style="padding:11px 14px;background:#f8fafc;color:#64748b;font-weight:600;">Status</td>
            <td style="padding:11px 14px;background:#f8fafc;color:#16a34a;font-weight:700;">Confirmed</td>
          </tr>
        </table>

        <!-- CTA Button -->
        <div style="text-align:center;margin:28px 0;">
          <a href="{receipt_url}"
             style="display:inline-block;padding:14px 36px;background:#dc2626;color:white;text-decoration:none;border-radius:8px;font-weight:700;font-size:15px;">
            View &amp; Download Receipt
          </a>
        </div>

        <p style="color:#94a3b8;font-size:12px;border-top:1px solid #e2e8f0;padding-top:20px;margin:0;line-height:1.6;">
          Please save your booking reference number — you may need it at check-in or for support inquiries.<br><br>
          Questions? Email us at <a href="mailto:support@gettours.com.np" style="color:#dc2626;">support@gettours.com.np</a><br><br>
          Get Tours Nepal &mdash; Nepal's #1 Travel Agency
        </p>
      </div>
    </div>
    """

    try:
        send_mail(
            subject,
            strip_tags(html_message),
            settings.DEFAULT_FROM_EMAIL,
            [email],
            html_message=html_message,
            fail_silently=True,
        )
        logger.info(
            "Booking confirmation email sent to %s for %s",
            email, booking.booking_reference,
        )
    except Exception:
        logger.exception(
            "Failed to send booking confirmation email to %s for %s",
            email, booking.booking_reference,
        )


def send_admin_booking_notification(booking_type: str, booking) -> None:
    """
    Notify staff/admins when a booking is confirmed.

    Recipients are read from settings.BOOKING_NOTIFY_EMAILS (comma-separated env
    var). Falls back to DEFAULT_FROM_EMAIL so at least someone is alerted.
    """
    recipients = getattr(settings, "BOOKING_NOTIFY_EMAILS", None)
    if not recipients:
        fallback = getattr(settings, "DEFAULT_FROM_EMAIL", "")
        recipients = [fallback] if fallback else []
    if not recipients:
        logger.warning("No admin notification recipients configured.")
        return

    if booking_type.upper() == "TOUR":
        item_title = booking.tour.title
        item_label = "Tour"
        qty_label = f"{booking.persons} person(s)"
        date_label = str(booking.travel_date)
    else:
        item_title = booking.event.title
        item_label = "Event"
        qty_label = f"{booking.tickets} ticket(s)"
        dt = booking.event.event_date
        date_label = dt.strftime("%d %b %Y, %I:%M %p") if hasattr(dt, "strftime") else str(dt)

    subject = f"[New Booking] {booking.booking_reference} — {item_title}"

    text_body = (
        f"A new booking has been confirmed.\n\n"
        f"Reference:       {booking.booking_reference}\n"
        f"Type:            {item_label}\n"
        f"Item:            {item_title}\n"
        f"Date:            {date_label}\n"
        f"Quantity:        {qty_label}\n"
        f"Customer name:   {booking.customer_name or '—'}\n"
        f"Customer email:  {booking.customer_email or '—'}\n"
        f"Customer phone:  {getattr(booking, 'guest_phone', '') or (booking.user.phone if booking.user and hasattr(booking.user, 'phone') else '—')}\n"
        f"Special requests: {getattr(booking, 'special_requests', '') or '—'}\n"
        f"Total paid:      {booking.currency} {booking.total_amount}\n"
        f"Status:          {booking.status}\n"
        f"Payment ref:     {booking.payment_reference or '—'}\n"
    )

    try:
        send_mail(
            subject,
            text_body,
            settings.DEFAULT_FROM_EMAIL,
            recipients,
            fail_silently=True,
        )
        logger.info(
            "Admin notification email sent to %s for %s",
            recipients, booking.booking_reference,
        )
    except Exception:
        logger.exception(
            "Failed to send admin notification email for %s",
            booking.booking_reference,
        )
