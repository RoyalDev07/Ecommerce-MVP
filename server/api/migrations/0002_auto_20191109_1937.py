# Generated by Django 2.2.6 on 2019-11-09 19:37

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='customuser',
            name='role',
            field=models.CharField(blank=True, choices=[('USER', 'user'), ('ADMIN', 'admin'), ('MANAGER', 'manager')], default='user', max_length=255),
        ),
    ]
