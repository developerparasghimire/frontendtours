from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("bookings", "0005_eventbooking_special_requests_and_more"),
    ]

    operations = [
        migrations.AlterField(
            model_name="tourbooking",
            name="currency",
            field=models.CharField(default="USD", max_length=10),
        ),
        migrations.AlterField(
            model_name="eventbooking",
            name="currency",
            field=models.CharField(default="USD", max_length=10),
        ),
    ]
