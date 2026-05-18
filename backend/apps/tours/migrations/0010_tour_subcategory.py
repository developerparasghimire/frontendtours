from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tours', '0009_convert_prices_npr_to_usd'),
    ]

    operations = [
        migrations.AddField(
            model_name='tour',
            name='subcategory',
            field=models.CharField(
                blank=True,
                default='',
                help_text='Optional sub-category — primarily for Trekking (e.g. Everest Region, Annapurna Region, Langtang, Manaslu, Mustang, Short Treks).',
                max_length=100,
            ),
        ),
    ]
