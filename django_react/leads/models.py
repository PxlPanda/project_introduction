from django.db import models
from django.core.exceptions import ValidationError

# Валидатор для email, чтобы проверять домен edu.misis.ru
def validate_edu_misis_email(value):
    if not value.endswith('@edu.misis.ru'):
        raise ValidationError('Email должен быть на домене @edu.misis.ru')

# Модель преподавателя
class Teacher(models.Model):
    full_name = models.CharField(max_length=255)
    password = models.CharField(max_length=255)

    def __str__(self):
        return self.full_name


# Модель студента
class Student(models.Model):
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    full_name = models.CharField(max_length=255, blank=True)
    group_name = models.CharField(max_length=255, blank=True)
    student_number = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return self.full_name
