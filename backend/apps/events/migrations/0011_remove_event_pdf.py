from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('events', '0010_event_pdf_eventpdflead'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='event',
            name='pdf',
        ),
    ]
