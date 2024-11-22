from django.shortcuts import render, redirect
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth import authenticate, login
from leads.models import Teacher, Student
from leads.serializers import TeacherSerializer, StudentSerializer
from django.contrib.auth.decorators import login_required
from django.http import FileResponse, Http404
import os
from django.conf import settings

from django.shortcuts import render

def index(request):
    """
    Главная страница.
    """
    return render(request, 'index.html')  # Убедитесь, что у вас есть файл index.html

# Регистрация преподавателя
@api_view(['POST'])
def register_teacher(request):
    """
    Регистрация нового преподавателя.
    """
    serializer = TeacherSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'Преподаватель успешно зарегистрирован'}, status=201)
    return Response(serializer.errors, status=400)

# Регистрация студента
@api_view(['POST'])
def register_student(request):
    """
    Регистрация нового студента.
    """
    serializer = StudentSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'Студент успешно зарегистрирован'}, status=201)
    return Response(serializer.errors, status=400)

# Авторизация пользователя
@api_view(['POST'])
def login_user(request):
    """
    Авторизация пользователя через API.
    """
    email = request.data.get('email')
    password = request.data.get('password')
    try:
        teacher = Teacher.objects.get(email=email)
        user = authenticate(request, username=teacher.email, password=password)
    except Teacher.DoesNotExist:
        try:
            student = Student.objects.get(email=email)
            user = authenticate(request, username=student.email, password=password)
        except Student.DoesNotExist:
            return Response({'message': 'Пользователь не найден'}, status=404)

    if user:
        login(request, user)  # Создание сессии
        return Response({'message': 'Вход выполнен успешно'}, status=200)
    return Response({'message': 'Неверный пароль'}, status=401)

# Страница входа
def signin(request):
    """
    Страница входа. Обрабатывает GET и POST запросы.
    """
    if request.user.is_authenticated:
        return redirect('home')  # Перенаправление авторизованных пользователей
    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')
        user = authenticate(request, username=email, password=password)
        if user:
            login(request, user)
            return redirect('home')  # Перенаправление после успешного входа
        return render(request, 'signin.html', {'error': 'Неверные учетные данные'})
    return render(request, 'signin.html')

# Главная страница для записи на занятия
@login_required
def home(request):
    """
    Главная страница для записи на физкультуру.
    Отображает доступные залы и состояние записи.
    """
    halls = [
        {'name': 'Тренажёрный зал', 'time': '10:50-12:25', 'capacity': 22, 'max_capacity': 30},
        {'name': 'Игровой зал', 'time': '9:00-10:35', 'capacity': 15, 'max_capacity': 30},
        {'name': 'Йога', 'time': '9:00-10:35', 'capacity': 30, 'max_capacity': 30},
    ]

    # Логика обновления времени (примерно)
    current_time = request.GET.get('time', '10:50-12:25')
    times = ['9:00-10:35', '10:50-12:25', '12:40-14:15', '14:30-16:05', '16:30-18:05', '18:20-20:00']

    context = {
        'halls': halls,
        'times': times,
        'current_time': current_time,
    }
    return render(request, 'home.html', context)

# Обработчик статики
def serve_static(request, path):
    """
    Обрабатывает запросы на статику.
    """
    file_path = os.path.join(settings.STATIC_ROOT, path)
    if os.path.exists(file_path):
        return FileResponse(open(file_path, 'rb'))
    raise Http404("Файл не найден")

# Примерный список залов для демонстрации
HALLS = [
    {'name': 'Тренажёрный зал', 'time': '10:50-12:25', 'capacity': 22, 'max_capacity': 30},
    {'name': 'Игровой зал', 'time': '9:00-10:35', 'capacity': 15, 'max_capacity': 30},
    {'name': 'Йога', 'time': '9:00-10:35', 'capacity': 30, 'max_capacity': 30},
]

# Функция для получения информации о залах
@api_view(['GET'])
def get_halls(request):
    """
    Получение информации о залах для записи на занятия.
    """
    return Response({'halls': HALLS}, status=200)