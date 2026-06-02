from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('tours', '0013_tour_pdf_tourpdflead'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='tour',
            name='pdf',
        ),
    ]
