from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('common', '0017_category_translations_eventpopup_translations_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='TranslationCache',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('source_hash', models.CharField(db_index=True, max_length=64)),
                ('target_lang', models.CharField(max_length=8)),
                ('translated_text', models.TextField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'unique_together': {('source_hash', 'target_lang')},
            },
        ),
    ]
