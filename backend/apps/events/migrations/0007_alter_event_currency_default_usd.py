from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("events", "0006_add_gallery_to_event"),
    ]

    operations = [
        migrations.AlterField(
            model_name="event",
            name="currency",
            field=models.CharField(default="USD", max_length=10),
        ),
    ]
