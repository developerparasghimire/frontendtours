from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('common', '0008_leader_category_siteconfig_google_map_url'),
    ]

    operations = [
        migrations.CreateModel(
            name='Category',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('kind', models.CharField(choices=[('tour', 'Tour'), ('event', 'Event')], max_length=10)),
                ('name', models.CharField(max_length=100)),
                ('order', models.PositiveIntegerField(default=0, help_text='Display order (lower numbers first).')),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('parent', models.ForeignKey(
                    blank=True,
                    help_text='Leave blank to create a top-level category. Set to create a sub-category under another category.',
                    null=True,
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='subcategories',
                    to='common.category',
                )),
            ],
            options={
                'verbose_name': 'Category',
                'verbose_name_plural': 'Categories',
                'ordering': ['kind', 'order', 'name'],
            },
        ),
        migrations.AddConstraint(
            model_name='category',
            constraint=models.UniqueConstraint(
                fields=('kind', 'parent', 'name'),
                name='unique_category_per_parent_and_kind',
            ),
        ),
    ]
