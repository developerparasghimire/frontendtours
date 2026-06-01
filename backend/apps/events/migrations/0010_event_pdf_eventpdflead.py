from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('events', '0009_convert_prices_npr_to_usd'),
    ]

    operations = [
        migrations.AddField(
            model_name='event',
            name='pdf',
            field=models.FileField(blank=True, help_text='Downloadable event plan PDF (optional)', null=True, upload_to='events/pdfs/'),
        ),
        migrations.CreateModel(
            name='EventPDFLead',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('email', models.EmailField(max_length=254)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('event', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='pdf_leads', to='events.event')),
            ],
            options={
                'ordering': ['-created_at'],
                'unique_together': {('email', 'event')},
            },
        ),
    ]
