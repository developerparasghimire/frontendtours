from django.db import migrations


def set_currency_usd(apps, schema_editor):
    Tour = apps.get_model('tours', 'Tour')
    Tour.objects.filter(currency='NPR').update(currency='USD')


def reverse_currency(apps, schema_editor):
    pass  # intentionally irreversible


class Migration(migrations.Migration):

    dependencies = [
        ('tours', '0007_alter_tour_currency_default_usd'),
    ]

    operations = [
        migrations.RunPython(set_currency_usd, reverse_currency),
    ]
