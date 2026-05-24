from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('common', '0011_siteconfig_home_about_heading'),
    ]

    operations = [
        migrations.AddField(
            model_name='siteconfig',
            name='home_about_eyebrow',
            field=models.CharField(blank=True, default='About Us', help_text='Small uppercase label above the home page About Us heading.', max_length=120),
        ),
        migrations.AddField(
            model_name='siteconfig',
            name='home_about_paragraph_1',
            field=models.TextField(blank=True, default='', help_text='First paragraph in the home page About Us section.'),
        ),
        migrations.AddField(
            model_name='siteconfig',
            name='home_about_paragraph_2',
            field=models.TextField(blank=True, default='', help_text='Second paragraph in the home page About Us section (optional).'),
        ),
    ]
