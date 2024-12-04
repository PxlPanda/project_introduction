from django.db import migrations

def create_initial_data(apps, schema_editor):
    Location = apps.get_model('leads', 'Location')
    Hall = apps.get_model('leads', 'Hall')

    # Создаем локации
    gorny = Location.objects.create(name='gorny')
    belyaevo = Location.objects.create(name='belyevo')

    # Создаем залы для Горного
    halls_gorny = [
        {
            'name': 'Тренажерный зал',
            'capacity': 20,
            'is_active': True
        },
        {
            'name': 'Спортивный зал',
            'capacity': 30,
            'is_active': True
        },
        {
            'name': 'Зал единоборств',
            'capacity': 15,
            'is_active': True
        }
    ]

    # Создаем залы для Беляево
    halls_belyaevo = [
        {
            'name': 'Фитнес зал',
            'capacity': 25,
            'is_active': True
        },
        {
            'name': 'Игровой зал',
            'capacity': 40,
            'is_active': True
        }
    ]

    # Добавляем залы в базу данных
    for hall_data in halls_gorny:
        Hall.objects.create(location=gorny, **hall_data)

    for hall_data in halls_belyaevo:
        Hall.objects.create(location=belyaevo, **hall_data)

def remove_initial_data(apps, schema_editor):
    Location = apps.get_model('leads', 'Location')
    Hall = apps.get_model('leads', 'Hall')
    
    Hall.objects.all().delete()
    Location.objects.all().delete()

class Migration(migrations.Migration):
    dependencies = [
        ('leads', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_initial_data, remove_initial_data),
    ]
