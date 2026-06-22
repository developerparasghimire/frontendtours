from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('events', '0012_event_translations'),
    ]

    operations = [
        migrations.CreateModel(
            name='EventFAQ',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('question', models.CharField(max_length=500)),
                ('answer', models.TextField()),
                ('order', models.PositiveIntegerField(default=0, help_text='Display order (lower = first)')),
                ('translations', models.JSONField(blank=True, default=dict)),
                ('event', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='faqs', to='events.event')),
            ],
            options={
                'ordering': ['order'],
            },
        ),
    ]
