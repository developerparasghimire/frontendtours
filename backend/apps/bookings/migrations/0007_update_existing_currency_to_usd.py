from django.db import migrations


def set_currency_usd(apps, schema_editor):
    TourBooking = apps.get_model('bookings', 'TourBooking')
    EventBooking = apps.get_model('bookings', 'EventBooking')
    TourBooking.objects.filter(currency='NPR').update(currency='USD')
    EventBooking.objects.filter(currency='NPR').update(currency='USD')


def reverse_currency(apps, schema_editor):
    pass  # intentionally irreversible


class Migration(migrations.Migration):

    dependencies = [
        ('bookings', '0006_alter_currency_default_usd'),
    ]

    operations = [
        migrations.RunPython(set_currency_usd, reverse_currency),
    ]
