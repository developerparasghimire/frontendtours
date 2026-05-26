from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('common', '0012_siteconfig_home_about_paragraphs'),
    ]

    operations = [
        migrations.AddField(model_name='siteconfig', name='home_gallery_image_1', field=models.ImageField(blank=True, null=True, upload_to='site/gallery/', help_text='Gallery slider image 1')),
        migrations.AddField(model_name='siteconfig', name='home_gallery_image_2', field=models.ImageField(blank=True, null=True, upload_to='site/gallery/', help_text='Gallery slider image 2')),
        migrations.AddField(model_name='siteconfig', name='home_gallery_image_3', field=models.ImageField(blank=True, null=True, upload_to='site/gallery/', help_text='Gallery slider image 3')),
        migrations.AddField(model_name='siteconfig', name='home_gallery_image_4', field=models.ImageField(blank=True, null=True, upload_to='site/gallery/', help_text='Gallery slider image 4')),
        migrations.AddField(model_name='siteconfig', name='home_gallery_image_5', field=models.ImageField(blank=True, null=True, upload_to='site/gallery/', help_text='Gallery slider image 5')),
        migrations.AddField(model_name='siteconfig', name='home_gallery_image_6', field=models.ImageField(blank=True, null=True, upload_to='site/gallery/', help_text='Gallery slider image 6')),
        migrations.AddField(model_name='siteconfig', name='home_gallery_image_7', field=models.ImageField(blank=True, null=True, upload_to='site/gallery/', help_text='Gallery slider image 7')),
        migrations.AddField(model_name='siteconfig', name='home_gallery_image_8', field=models.ImageField(blank=True, null=True, upload_to='site/gallery/', help_text='Gallery slider image 8')),
    ]
