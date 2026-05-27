from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('common', '0013_siteconfig_home_gallery_images'),
    ]

    operations = [
        migrations.AddField(model_name='siteconfig', name='home_gallery_image_9', field=models.ImageField(blank=True, null=True, upload_to='site/gallery/', help_text='Gallery slider image 9')),
        migrations.AddField(model_name='siteconfig', name='home_gallery_image_10', field=models.ImageField(blank=True, null=True, upload_to='site/gallery/', help_text='Gallery slider image 10')),
        migrations.AddField(model_name='siteconfig', name='home_gallery_image_11', field=models.ImageField(blank=True, null=True, upload_to='site/gallery/', help_text='Gallery slider image 11')),
        migrations.AddField(model_name='siteconfig', name='home_gallery_image_12', field=models.ImageField(blank=True, null=True, upload_to='site/gallery/', help_text='Gallery slider image 12')),
    ]
