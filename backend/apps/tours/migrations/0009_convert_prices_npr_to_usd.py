from django.db import migrations


def convert_tour_prices_to_usd(apps, schema_editor):
    """Divide all tour base_price values by 133 (NPR → USD conversion)."""
    Tour = apps.get_model('tours', 'Tour')
    for tour in Tour.objects.all():
        if tour.base_price and float(tour.base_price) > 0:
            tour.base_price = round(float(tour.base_price) / 133, 2)
            tour.save(update_fields=['base_price'])


def reverse_convert_tour_prices(apps, schema_editor):
    """Multiply all tour base_price values by 133 (USD → NPR reversal)."""
    Tour = apps.get_model('tours', 'Tour')
    for tour in Tour.objects.all():
        if tour.base_price and float(tour.base_price) > 0:
            tour.base_price = round(float(tour.base_price) * 133, 2)
            tour.save(update_fields=['base_price'])


class Migration(migrations.Migration):

    dependencies = [
        ('tours', '0008_update_existing_currency_to_usd'),
    ]

    operations = [
        migrations.RunPython(
            convert_tour_prices_to_usd,
            reverse_convert_tour_prices,
        ),
    ]
