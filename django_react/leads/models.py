from django.db import models
from django.core.exceptions import ValidationError
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
import re

def validate_edu_misis_email(value):
    if not value.endswith('@edu.misis.ru'):
        raise ValidationError('Email должен быть на домене @edu.misis.ru')

def validate_full_name(value):
    if not re.match(r'^[А-ЯЁ][а-яё]+\s[А-ЯЁ][а-яё]+\s[А-ЯЁ][а-яё]+$', value):
        raise ValidationError('ФИО должно быть в формате: Фамилия Имя Отчество')

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email обязателен')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True, validators=[validate_edu_misis_email])
    full_name = models.CharField(max_length=255, validators=[validate_full_name])
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_teacher = models.BooleanField(default=False)
    is_student = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)
    
    objects = CustomUserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name']

    def __str__(self):
        return self.email

class Student(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    group_name = models.CharField(max_length=50)  # Оставляем просто CharField без дополнительных валидаторов
    student_number = models.CharField(max_length=50, unique=True)
    points = models.IntegerField(default=0)

    def clean(self):
        # Проверяем, что номер студенческого состоит только из цифр
        if not self.student_number.isdigit():
            raise ValidationError({'student_number': 'Номер студенческого должен состоять только из цифр'})
        
        # Проверяем формат группы
        if not re.match(r'^[А-ЯЁа-яё]+-\d+-\d+$', self.group_name):
            raise ValidationError({'group_name': 'Группа должна быть в формате Буквы-цифры-цифры'})

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.full_name} - {self.group_name}"

class Teacher(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='teacher_profile')

    def __str__(self):
        return self.user.full_name

class Location(models.Model):
    name = models.CharField(max_length=50)  # Горный или Беляево

    def __str__(self):
        return self.name

class Hall(models.Model):
    name = models.CharField(max_length=100)
    location = models.ForeignKey(Location, on_delete=models.CASCADE, related_name='halls')
    capacity = models.IntegerField()
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ['name', 'location']

    def __str__(self):
        return f"{self.location.name} - {self.name}"

class PinnedHall(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='pinned_halls')
    hall = models.ForeignKey(Hall, on_delete=models.CASCADE)
    order = models.IntegerField(default=0)  # Порядок закрепленных залов

    class Meta:
        unique_together = ['user', 'hall']
        ordering = ['order']

class Booking(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Ожидание'),
        ('PRESENT', 'Присутствует'),
        ('ABSENT', 'Отсутствует'),
    ]

    hall = models.ForeignKey(Hall, on_delete=models.CASCADE, related_name='bookings')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='bookings')
    date = models.DateField()
    time_slot = models.TimeField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)
    marked_by = models.ForeignKey(Teacher, null=True, blank=True, on_delete=models.SET_NULL, related_name='marked_bookings')
    marked_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=['date', 'status']),
            models.Index(fields=['time_slot']),
        ]
        unique_together = ['hall', 'date', 'time_slot', 'student']

    def __str__(self):
        return f"{self.student.user.full_name} - {self.hall.name} ({self.date} {self.time_slot}) [{self.status}]"

class PointsHistory(models.Model):
    POINTS_TYPE_CHOICES = [
        ('AUTO', 'Автоматическое'),
        ('MANUAL', 'Ручное'),
    ]
    
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='points_history')
    points = models.IntegerField()
    reason = models.CharField(max_length=255)
    date = models.DateTimeField(auto_now_add=True)
    booking = models.ForeignKey(Booking, null=True, blank=True, on_delete=models.SET_NULL, related_name='points')
    awarded_by = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='awarded_points')
    points_type = models.CharField(max_length=10, choices=POINTS_TYPE_CHOICES, default='AUTO')

    def __str__(self):
        return f"{self.student} - {self.points} баллов ({self.get_points_type_display()})"

    def save(self, *args, **kwargs):
        if not self.booking:
            self.points_type = 'MANUAL'
        super().save(*args, **kwargs)