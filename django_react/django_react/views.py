from django.shortcuts import render, redirect
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth import authenticate, login
from leads.models import Teacher, Student
from leads.serializers import TeacherSerializer, StudentSerializer
from django.contrib.auth.decorators import login_required
from django.http import FileResponse, Http404, HttpResponse, JsonResponse
import os
from django.conf import settings
from rest_framework import status
import logging
from rest_framework.permissions import AllowAny
from rest_framework.decorators import permission_classes

logger = logging.getLogger(__name__)

from django.shortcuts import render

def index(request):
    try:
        with open(os.path.join(settings.REACT_APP_DIR, 'build', 'index.html'), encoding='utf-8') as f:
            return HttpResponse(f.read(), content_type='text/html; charset=utf-8')
    except FileNotFoundError:
        return HttpResponse(
            """
            This URL is only used when you have built the production
            version of the app. Visit http://localhost:3000/ instead, or
            run `npm run build` to test the production version.
            """,
            status=501,
            content_type='text/html; charset=utf-8'
        )

# Регистрация преподавателя
@api_view(['POST'])
def register_teacher(request):
    """
    Регистрация нового преподавателя.
    """
    serializer = TeacherSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'Преподаватель успешно зарегистрирован'}, status=status.HTTP_201_CREATED)
    logger.error(f"Ошибка регистрации преподавателя: {serializer.errors}")
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Регистрация студента
@api_view(['POST'])
def register_student(request):
    """
    Регистрация нового студента.
    """
    serializer = StudentSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'Студент успешно зарегистрирован'}, status=status.HTTP_201_CREATED)
    logger.error(f"Ошибка регистрации студента: {serializer.errors}")
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Авторизация пользователя
@api_view(['POST'])
def login_user(request):
    """
    Авторизация пользователя (преподавателя или студента).
    """
    try:
        user_type = request.data.get('user_type')
        password = request.data.get('password')

        if user_type == 'teacher':
            full_name = request.data.get('full_name')
            if not full_name:
                return Response({'error': 'ФИО обязательно'}, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                teacher = Teacher.objects.get(full_name=full_name)
                if teacher.check_password(password):
                    return Response({
                        'message': 'Успешный вход',
                        'user_type': 'teacher',
                        'full_name': teacher.full_name
                    }, status=status.HTTP_200_OK)
            except Teacher.DoesNotExist:
                logger.warning(f"Попытка входа с несуществующим ФИО преподавателя: {full_name}")
                return Response({'error': 'Неверные учетные данные'}, status=status.HTTP_401_UNAUTHORIZED)

        elif user_type == 'student':
            email = request.data.get('email')
            if not email:
                return Response({'error': 'Email обязателен'}, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                student = Student.objects.get(email=email)
                if student.check_password(password):
                    return Response({
                        'message': 'Успешный вход',
                        'user_type': 'student',
                        'email': student.email,
                        'full_name': student.full_name
                    }, status=status.HTTP_200_OK)
            except Student.DoesNotExist:
                logger.warning(f"Попытка входа с несуществующим email студента: {email}")
                return Response({'error': 'Неверные учетные данные'}, status=status.HTTP_401_UNAUTHORIZED)
        
        return Response({'error': 'Неверный пароль'}, status=status.HTTP_401_UNAUTHORIZED)

    except Exception as e:
        logger.error(f"Ошибка при входе: {str(e)}")
        return Response({'error': 'Ошибка сервера'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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
    return Response({'halls': HALLS}, status=status.HTTP_200_OK)

# Serve manifest.json file
@api_view(['GET'])
@permission_classes([AllowAny])
def serve_manifest(request):
    try:
        manifest_path = os.path.join(settings.REACT_APP_DIR, 'public', 'manifest.json')
        if os.path.exists(manifest_path):
            with open(manifest_path, 'r', encoding='utf-8') as f:
                manifest_data = f.read()
                return HttpResponse(
                    manifest_data,
                    content_type='application/json; charset=utf-8'
                )
        return HttpResponse(
            '{"error": "Manifest file not found"}',
            status=404,
            content_type='application/json'
        )
    except Exception as e:
        logger.error(f"Error serving manifest.json: {str(e)}")
        return HttpResponse(
            '{"error": "Internal server error"}',
            status=500,
            content_type='application/json'
        )