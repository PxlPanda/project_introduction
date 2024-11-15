from django.db import models
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model

# Получаем модель пользователя, чтобы избежать циклического импорта
User = get_user_model()

# Валидация для email
def validate_edu_misis_email(value):
    if not value.endswith('@edu.misis.ru'):
        raise ValidationError('Email должен оканчиваться на @edu.misis.ru')

class Leads(models.Model):
    name = models.CharField(max_length=100, verbose_name="Имя")  # Исправлено max_lenght на max_length
    email = models.EmailField(unique=True, validators=[validate_edu_misis_email],verbose_name="Email")  # Поле для email с проверкой
    group = models.CharField(max_length=10,verbose_name="Группа")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name= "Дата создания")
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = "Лид"
        verbose_name_plural = "Лиды"