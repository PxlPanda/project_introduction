from rest_framework import serializers
from leads.models import Teacher, Student
from django.contrib.auth.hashers import make_password
from django.core.exceptions import ValidationError
import re


# Сериализатор для преподавателя
class TeacherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Teacher
        fields = ['id', 'full_name', 'password']

    def validate_password(self, value):
        # Хэшируем пароль перед сохранением
        return make_password(value)

    def create(self, validated_data):
        validated_data['password'] = self.validate_password(validated_data['password'])
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if 'password' in validated_data:
            validated_data['password'] = self.validate_password(validated_data['password'])
        return super().update(instance, validated_data)


# Сериализатор для студента
class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ['id', 'email', 'password', 'full_name', 'group_name', 'student_number']

    def validate_password(self, value):
        # Хэшируем пароль перед сохранением
        return make_password(value)

    def validate_email(self, value):
        # Проверка на правильность формата email (example@edu.misis.ru)
        email_pattern = r'^[a-zA-Z0-9._%+-]+@edu\.misis\.ru$'
        if not re.match(email_pattern, value):
            raise ValidationError("Некорректный формат email. Используйте ваш email на edu.misis.ru")
        return value

    def create(self, validated_data):
        validated_data['password'] = self.validate_password(validated_data['password'])
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if 'password' in validated_data:
            validated_data['password'] = self.validate_password(validated_data['password'])
        return super().update(instance, validated_data)
