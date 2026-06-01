from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('tours', '0012_tourguide_tourguidelanguage'),
    ]

    operations = [
        migrations.AddField(
            model_name='tour',
            name='pdf',
            field=models.FileField(blank=True, help_text='Downloadable tour plan PDF (optional)', null=True, upload_to='tours/pdfs/'),
        ),
        migrations.CreateModel(
            name='TourPDFLead',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('email', models.EmailField(max_length=254)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('tour', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='pdf_leads', to='tours.tour')),
            ],
            options={
                'ordering': ['-created_at'],
                'unique_together': {('email', 'tour')},
            },
        ),
    ]
