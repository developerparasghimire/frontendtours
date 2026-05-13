from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("tours", "0006_add_tour_gallery_image"),
    ]

    operations = [
        migrations.AlterField(
            model_name="tour",
            name="currency",
            field=models.CharField(default="USD", max_length=10),
        ),
    ]
