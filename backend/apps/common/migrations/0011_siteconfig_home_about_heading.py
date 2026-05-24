from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('common', '0010_category_description_category_icon_category_image_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='siteconfig',
            name='home_about_heading',
            field=models.CharField(blank=True, default='Your Himalayan Adventure Awaits', help_text="Main heading in the home page About Us section.", max_length=255),
        ),
    ]
