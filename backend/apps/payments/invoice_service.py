from io import BytesIO
from django.core.files.base import ContentFile
# import weasyprint
from django.template.loader import render_to_string
from apps.bookings.models import TourBooking

def generate_invoice_pdf(booking_id: int):
    """
    Generates a PDF byte stream using WeasyPrint based on an HTML template.
    Usually kicked off via Celery task post-payment success.
    """
    booking = TourBooking.objects.get(id=booking_id)
    
    # 1. Render data into HTML Template
    html_string = render_to_string('invoices/invoice_template.html', {
        'booking': booking,
        'tax_amount': booking.total_amount * 0.13, # 13% Mock VAT
        'subtotal': booking.total_amount * 0.87,
        'total': booking.total_amount
    })
    
    pdf_buffer = BytesIO()
    
    # 2. WeasyPrint conversion
    # weasyprint.HTML(string=html_string).write_pdf(pdf_buffer)
    
    # 3. Store in Model or Email directly
    # invoice.file.save(f"invoice_{booking.id}.pdf", ContentFile(pdf_buffer.getvalue()))
    
    return pdf_buffer
