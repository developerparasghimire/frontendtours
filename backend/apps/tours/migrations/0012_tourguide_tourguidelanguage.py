from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('tours', '0011_tour_best_season'),
    ]

    operations = [
        migrations.CreateModel(
            name='TourGuide',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
                ('bio', models.TextField(blank=True)),
                ('photo', models.ImageField(blank=True, null=True, upload_to='tours/guides/')),
                ('tour', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='guide', to='tours.tour')),
            ],
        ),
        migrations.CreateModel(
            name='TourGuideLanguage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('language', models.CharField(max_length=100)),
                ('rating', models.PositiveSmallIntegerField(default=5, help_text='Proficiency rating 1–5 stars')),
                ('guide', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='languages', to='tours.tourguide')),
            ],
            options={
                'ordering': ['-rating', 'language'],
                'unique_together': {('guide', 'language')},
            },
        ),
    ]
