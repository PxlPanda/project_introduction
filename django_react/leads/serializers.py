from rest_framework import serializers
from leads.models import Teacher, Student
from django.contrib.auth.hashers import make_password  # Импортируем хешер для паролей

# Сериализатор для преподавателя
class TeacherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Teacher
        fields = ['id', 'full_name', 'password']  # Убедитесь, что поле 'password' есть в модели Teacher

    # Хешируем пароль перед сохранением
    def validate_password(self, value):
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
        fields = ['id', 'full_name', 'email', 'password', 'group_name']  # Убедитесь, что 'password' есть в модели Student

    # Хешируем пароль перед сохранением
    def validate_password(self, value):
        return make_password(value)

    def create(self, validated_data):
        validated_data['password'] = self.validate_password(validated_data['password'])
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if 'password' in validated_data:
            validated_data['password'] = self.validate_password(validated_data['password'])
        return super().update(instance, validated_data)
