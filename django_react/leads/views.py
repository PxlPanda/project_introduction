# leads/views.py

from rest_framework.decorators import api_view
from rest_framework.response import Response
from leads.models import Teacher, Student
from leads.serializers import TeacherSerializer, StudentSerializer
from django.contrib.auth.hashers import make_password
from django.core.exceptions import ValidationError

@api_view(['POST'])
def register_student(request):
    """
    Регистрация нового студента.
    """
    # Проверяем, что почта передана
    email = request.data.get('email')
    password = request.data.get('password')

    if not email or not password:
        return Response({'message': 'Email и пароль обязательны.'}, status=400)
    
    # Создаем студента
    student_data = {
        'email': email,
        'password': make_password(password),
        'full_name': '',  # Мы будем заполнять позже
        'group_name': '',  # Мы будем заполнять позже
        'student_number': '',  # Мы будем заполнять позже
    }

    # Серилизуем данные
    serializer = StudentSerializer(data=student_data)

    if serializer.is_valid():
        serializer.save()  # Сохраняем студента в базе данных
        return Response({'message': 'Студент зарегистрирован успешно', 'data': serializer.data}, status=201)

    return Response(serializer.errors, status=400)


@api_view(['POST'])
def register_teacher(request):
    """
    Регистрация нового преподавателя.
    """
    # Проверяем, что ФИО и пароль переданы
    full_name = request.data.get('full_name')
    password = request.data.get('password')

    if not full_name or not password:
        return Response({'message': 'ФИО и пароль обязательны.'}, status=400)
    
    # Создаем преподавателя
    teacher_data = {
        'full_name': full_name,
        'password': make_password(password),
    }

    # Серилизуем данные
    serializer = TeacherSerializer(data=teacher_data)

    if serializer.is_valid():
        serializer.save()  # Сохраняем преподавателя в базе данных
        return Response({'message': 'Преподаватель зарегистрирован успешно', 'data': serializer.data}, status=201)

    return Response(serializer.errors, status=400)
