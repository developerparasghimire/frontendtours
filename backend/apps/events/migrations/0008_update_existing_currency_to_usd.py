from django.db import migrations


def set_currency_usd(apps, schema_editor):
    Event = apps.get_model('events', 'Event')
    Event.objects.filter(currency='NPR').update(currency='USD')


def reverse_currency(apps, schema_editor):
    pass  # intentionally irreversible


class Migration(migrations.Migration):

    dependencies = [
        ('events', '0007_alter_event_currency_default_usd'),
    ]

    operations = [
        migrations.RunPython(set_currency_usd, reverse_currency),
    ]
