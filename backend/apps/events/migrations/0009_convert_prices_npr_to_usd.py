from django.db import migrations


def convert_event_prices_to_usd(apps, schema_editor):
    """Divide all event base_price values by 133 (NPR → USD conversion)."""
    Event = apps.get_model('events', 'Event')
    for event in Event.objects.all():
        if event.base_price and float(event.base_price) > 0:
            event.base_price = round(float(event.base_price) / 133, 2)
            event.save(update_fields=['base_price'])


def reverse_convert_event_prices(apps, schema_editor):
    """Multiply all event base_price values by 133 (USD → NPR reversal)."""
    Event = apps.get_model('events', 'Event')
    for event in Event.objects.all():
        if event.base_price and float(event.base_price) > 0:
            event.base_price = round(float(event.base_price) * 133, 2)
            event.save(update_fields=['base_price'])


class Migration(migrations.Migration):

    dependencies = [
        ('events', '0008_update_existing_currency_to_usd'),
    ]

    operations = [
        migrations.RunPython(
            convert_event_prices_to_usd,
            reverse_convert_event_prices,
        ),
    ]
