from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('tours', '0014_remove_tour_pdf'),
    ]

    operations = [
        migrations.CreateModel(
            name='TourFAQ',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('question', models.CharField(max_length=500)),
                ('answer', models.TextField()),
                ('order', models.PositiveIntegerField(default=0, help_text='Display order (lower = first)')),
                ('tour', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='faqs', to='tours.tour')),
            ],
            options={
                'ordering': ['order'],
            },
        ),
    ]
