# Определяем список залов
HALLS = [
    {
        'name': 'Тренажерный зал',
        'max_capacity': 20,
        'time_slots': ['9:00', '10:50', '12:40', '14:30', '16:30', '18:20']
    },
    {
        'name': 'Игровой зал',
        'max_capacity': 30,
        'time_slots': ['9:00', '10:50', '12:40', '14:30', '16:30', '18:20']
    },
    {
        'name': 'Зал для фитнеса',
        'max_capacity': 15,
        'time_slots': ['9:00', '10:50', '12:40', '14:30', '16:30', '18:20']
    }
]

from django.shortcuts import render, redirect
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth import authenticate, login
from leads.models import Teacher, Student, PointsHistory, Booking, Hall
from leads.serializers import TeacherSerializer, StudentSerializer, HallSerializer
from django.contrib.auth.decorators import login_required
from django.http import FileResponse, Http404, HttpResponse, JsonResponse
import os
from django.conf import settings
from rest_framework import status
import logging
from leads.models import User, Teacher
from rest_framework.permissions import AllowAny
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from rest_framework_simplejwt.tokens import RefreshToken
from datetime import datetime

logger = logging.getLogger(__name__)

from rest_framework.authtoken.models import Token

@api_view(['POST'])
@permission_classes([AllowAny])
def login_api(request):
    """
    API endpoint для авторизации пользователя
    """
    try:
        print("Данные запроса:", request.data)
        logger.info(f"Получены данные для входа: {request.data}")
        
        user_type = request.data.get('user_type')
        email = request.data.get('email')
        password = request.data.get('password')
        admin_password = request.data.get('adminPassword')

        print(f"user_type: {user_type}")
        print(f"email: {email}")

        if user_type == 'student':
            logger.info(f"Попытка входа студента: {email}")
            
            if not email:
                return Response({'error': 'Email обязателен'}, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                # Ищем пользователя по email и is_student
                user = User.objects.get(email=email, is_student=True)
                student = Student.objects.get(user=user)
                
                auth_user = authenticate(request, email=email, password=password)
                
                if auth_user is not None:
                    # Создаем JWT токен
                    refresh = RefreshToken.for_user(user)
                    return Response({
                        'token': str(refresh.access_token),
                        'user_type': 'student',
                        'full_name': user.full_name,
                        'email': user.email
                    }, status=status.HTTP_200_OK)
                else:
                    logger.warning(f"Неверный пароль для студента: {email}")
                    return Response({'error': 'Неверный пароль'}, status=status.HTTP_401_UNAUTHORIZED)
                    
            except (User.DoesNotExist, Student.DoesNotExist):
                logger.warning(f"Студент не найден: {email}")
                return Response({'error': 'Студент не найден'}, status=status.HTTP_404_NOT_FOUND)

        elif user_type == 'teacher':
            full_name = request.data.get('full_name')
            logger.info(f"Попытка входа преподавателя: {full_name}")
            
            if not full_name:
                return Response({'error': 'ФИО обязательно'}, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                # Ищем пользователя по ФИО и is_teacher
                user = User.objects.get(full_name=full_name, is_teacher=True)
                teacher = Teacher.objects.get(user=user)

                # Если это не регистрация, проверяем административный пароль
                if admin_password:
                    if admin_password != settings.TEACHER_ADMIN_PASSWORD:
                        logger.warning(f"Неверный административный пароль для преподавателя: {full_name}")
                        return Response({'error': 'Неверный административный пароль'}, status=status.HTTP_401_UNAUTHORIZED)
                
                auth_user = authenticate(request, email=user.email, password=password)
                
                if auth_user is not None:
                    # Создаем JWT токен
                    refresh = RefreshToken.for_user(user)
                    return Response({
                        'token': str(refresh.access_token),
                        'user_type': 'teacher',
                        'full_name': user.full_name,
                        'email': user.email
                    }, status=status.HTTP_200_OK)
                else:
                    logger.warning(f"Неверный пароль для преподавателя: {full_name}")
                    return Response({'error': 'Неверный пароль'}, status=status.HTTP_401_UNAUTHORIZED)
                    
            except (User.DoesNotExist, Teacher.DoesNotExist):
                logger.warning(f"Преподаватель не найден: {full_name}")
                return Response({'error': 'Преподаватель не найден'}, status=status.HTTP_404_NOT_FOUND)
        
        else:
            logger.warning(f"Неверный тип пользователя: {user_type}")
            return Response({'error': 'Неверный тип пользователя'}, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        logger.error(f"Ошибка при входе: {str(e)}")
        return Response(
            {'error': f'Ошибка сервера при входе: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_students(request):
    """
    Получение списка всех студентов для преподавателя
    """
    if not hasattr(request.user, 'teacher_profile'):
        return Response(
            {'error': 'Доступ запрещен'}, 
            status=status.HTTP_403_FORBIDDEN
        )
        
    students = Student.objects.all()
    data = []
    for student in students:
        student_data = {
            'id': student.id,
            'name': student.user.full_name,
            'group': student.group_name,
            'points': student.points
        }
        data.append(student_data)
    return Response(data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_points(request):
    """
    Сохранение баллов для списка студентов
    """
    if not hasattr(request.user, 'teacher_profile'):
        return Response(
            {'error': 'Доступ запрещен'}, 
            status=status.HTTP_403_FORBIDDEN
        )
        
    try:
        students_points = request.data.get('students_points', [])
        for student_point in students_points:
            student_id = student_point.get('student_id')
            points = student_point.get('points')
            reason = student_point.get('reason')
            
            if not all([student_id, points is not None, reason]):
                continue
                
            student = Student.objects.get(id=student_id)
            PointsHistory.objects.create(
                student=student,
                points=points,
                reason=reason,
                awarded_by=request.user.teacher_profile
            )
            
        return Response({'message': 'Баллы успешно сохранены'})
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([AllowAny])
def get_server_time(request):
    """
    Получение текущего серверного времени
    """
    current_time = timezone.now()
    return Response({
        'timestamp': current_time.timestamp(),
        'datetime': current_time.isoformat()
    })

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

@api_view(['POST'])
@permission_classes([AllowAny])
def register_student(request):
    """
    Регистрация нового студента.
    """
    try:
        logger.info(f"Получены данные для регистрации студента: {request.data}")
        
        email = request.data.get('email')
        password = request.data.get('password')
        full_name = request.data.get('full_name')
        student_number = request.data.get('student_number')
        group_name = request.data.get('group_name')

        print("Полученные данные:")
        print(f"email: {email}")
        print(f"full_name: {full_name}")
        print(f"student_number: {student_number}")
        print(f"group_name: {group_name}")
        print(f"password length: {len(password) if password else 0}")

        if not email:
            return Response({'error': 'Email обязателен'}, status=status.HTTP_400_BAD_REQUEST)
        if not password:
            return Response({'error': 'Пароль обязателен'}, status=status.HTTP_400_BAD_REQUEST)
        if not full_name:
            return Response({'error': 'ФИО обязательно'}, status=status.HTTP_400_BAD_REQUEST)
        if not student_number:
            return Response({'error': 'Номер студенческого обязателен'}, status=status.HTTP_400_BAD_REQUEST)
        if not group_name:
            return Response({'error': 'Группа обязательна'}, status=status.HTTP_400_BAD_REQUEST)

        if not all([email, password, full_name, student_number, group_name]):
            return Response(
                {'error': 'Все поля обязательны для заполнения'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        if not password or len(password) < 6:
            return Response(
                {'error': 'Пароль должен содержать минимум 6 символов'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(email=email).exists():
            return Response(
                {'error': 'Студент с таким email уже зарегистрирован'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if Student.objects.filter(student_number=student_number).exists():
            return Response(
                {'error': 'Студент с таким номером студенческого уже зарегистрирован'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        user = User.objects.create_user(
            email=email,
            password=password,
            full_name=full_name,
            is_student=True,
            is_teacher=False
        )
        
        student = Student.objects.create(
            user=user,
            student_number=student_number,
            group_name=group_name
        )

        token, _ = Token.objects.get_or_create(user=user)

        logger.info(f"Студент успешно создан: {user.id}")
        
        return Response({
            'message': 'Студент успешно зарегистрирован',
            'token': token.key,
            'user_type': 'student',
            'full_name': user.full_name,
            'email': user.email
        }, status=status.HTTP_201_CREATED)
            
    except Exception as e:
        logger.error(f"Ошибка регистрации студента: {str(e)}")
        return Response(
            {'error': f'Ошибка сервера при регистрации: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([AllowAny])
def register_teacher(request):
    """
    Регистрация нового преподавателя.
    """
    try:
        logger.info(f"Получены данные для регистрации преподавателя: {request.data}")
        
        full_name = request.data.get('full_name')
        password = request.data.get('password')

        if not full_name:
            return Response(
                {'error': 'ФИО обязательно для заполнения'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        if not password or len(password) < 6:
            return Response(
                {'error': 'Пароль должен содержать минимум 6 символов'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(full_name=full_name, is_teacher=True).exists():
            return Response(
                {'error': 'Преподаватель с таким ФИО уже зарегистрирован'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        base_email = f"{full_name.replace(' ', '_').lower()}"
        email = f"{base_email}@edu.misis.ru"
        counter = 1
        while User.objects.filter(email=email).exists():
            email = f"{base_email}_{counter}@edu.misis.ru"
            counter += 1

        user = User.objects.create_user(
            email=email,
            password=password,
            full_name=full_name,
            is_teacher=True,
            is_student=False
        )
        
        teacher = Teacher.objects.create(user=user)

        token, _ = Token.objects.get_or_create(user=user)

        logger.info(f"Преподаватель успешно создан: {user.id}")
        
        return Response({
            'message': 'Преподаватель успешно зарегистрирован',
            'token': token.key,
            'user_type': 'teacher',
            'full_name': user.full_name,
            'email': user.email  # Возвращаем email, чтобы преподаватель знал свой логин
        }, status=status.HTTP_201_CREATED)
            
    except Exception as e:
        logger.error(f"Ошибка регистрации преподавателя: {str(e)}")
        return Response(
            {'error': f'Ошибка сервера при регистрации: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([AllowAny])
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

@login_required
def home(request):
    """
    Главная страница для записи на занятия.
    Отображает доступные залы и состояние записи.
    """
    halls = [
        {'name': 'Тренажёрный зал', 'time': '10:50-12:25', 'capacity': 22, 'max_capacity': 30},
        {'name': 'Игровой зал', 'time': '9:00-10:35', 'capacity': 15, 'max_capacity': 30},
        {'name': 'Йога', 'time': '9:00-10:35', 'capacity': 30, 'max_capacity': 30},
    ]

    current_time = request.GET.get('time', '10:50-12:25')
    times = ['9:00-10:35', '10:50-12:25', '12:40-14:15', '14:30-16:05', '16:30-18:05', '18:20-20:00']

    context = {
        'halls': halls,
        'times': times,
        'current_time': current_time,
    }
    return render(request, 'home.html', context)

def serve_static(request, path):
    """
    Обрабатывает запросы на статику.
    """
    file_path = os.path.join(settings.STATIC_ROOT, path)
    if os.path.exists(file_path):
        return FileResponse(open(file_path, 'rb'))
    raise Http404("Файл не найден")

HALLS = [
    {'name': 'Тренажёрный зал', 'time': '10:50-12:25', 'capacity': 22, 'max_capacity': 30},
    {'name': 'Игровой зал', 'time': '9:00-10:35', 'capacity': 15, 'max_capacity': 30},
    {'name': 'Йога', 'time': '9:00-10:35', 'capacity': 30, 'max_capacity': 30},
]

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_halls(request):
    try:
        from leads.serializers import HallSerializer
        
        date_str = request.GET.get('date')
        location = request.GET.get('location', 'gorny')
        
        if not date_str:
            return Response({'error': 'Date parameter is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Проверяем формат даты
        try:
            from datetime import datetime, time
            parsed_date = datetime.strptime(date_str, '%Y-%m-%d')
        except ValueError as e:
            return Response({'error': 'Invalid date format'}, status=status.HTTP_400_BAD_REQUEST)
            
        location_mapping = {
            'gorny': 'Горный',
            'belyaevo': 'Беляево'
        }
        location = location_mapping.get(location, location)
        
        halls = Hall.objects.filter(location__name=location)
        
        if not halls.exists():
            default_halls = [
                {
                    'id': 1,
                    'name': 'Тренажерный зал',
                    'max_capacity': 20,
                },
                {
                    'id': 2,
                    'name': 'Игровой зал',
                    'max_capacity': 30,
                },
                {
                    'id': 3,
                    'name': 'Зал для фитнеса',
                    'max_capacity': 15,
                }
            ]
            halls = default_halls
            
        # Используем сериализатор с контекстом даты
        serializer = HallSerializer(halls, many=True, context={'date': parsed_date.date()})
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def award_points_manually(request):
    """
    Ручное начисление баллов студенту преподавателем
    """
    try:
        if not hasattr(request.user, 'teacher_profile'):
            return Response(
                {'error': 'Только преподаватели могут начислять баллы'}, 
                status=status.HTTP_403_FORBIDDEN
            )

        student_id = request.data.get('student_id')
        points = request.data.get('points')
        reason = request.data.get('reason')

        if not all([student_id, points, reason]):
            return Response(
                {'error': 'Необходимо указать student_id, points и reason'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            student = Student.objects.get(id=student_id)
        except Student.DoesNotExist:
            return Response(
                {'error': 'Студент не найден'}, 
                status=status.HTTP_404_NOT_FOUND
            )

        points_history = PointsHistory.objects.create(
            student=student,
            points=points,
            reason=reason,
            awarded_by=request.user.teacher_profile,
            points_type='MANUAL'
        )

        return Response({
            'message': 'Баллы успешно начислены',
            'points_history': {
                'id': points_history.id,
                'student': student.user.full_name,
                'points': points,
                'reason': reason,
                'date': points_history.date,
                'type': 'Ручное начисление'
            }
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_student_data(request):
    """
    API endpoint для получения данных профиля студента
    """
    try:
        logger.info(f"Получен запрос на данные студента от пользователя: {request.user.email}")
        
        student = Student.objects.get(user=request.user)
        logger.info(f"Найден студент: {student.user.full_name}")
        
        points_history = PointsHistory.objects.filter(student=student).order_by('-date')
        logger.info(f"Получена история баллов: {points_history.count()} записей")
        
        history_data = [{
            'id': record.id,
            'date': record.date.strftime('%Y-%m-%d %H:%M:%S'),
            'points': record.points,
            'reason': record.reason,
            'type': record.points_type,
            'awarded_by': record.awarded_by.user.full_name if record.awarded_by else None
        } for record in points_history]
        
        response_data = {
            'full_name': student.user.full_name,
            'group': student.group_name,  
            'student_id': student.student_number,  
            'current_points': student.points,
            'points_history': history_data
        }
        
        logger.info("Данные успешно подготовлены")
        return Response(response_data)
        
    except Student.DoesNotExist:
        logger.error(f"Студент не найден для пользователя: {request.user.email}")
        return Response(
            {'error': 'Student not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Ошибка в get_student_data: {str(e)}")
        logger.error(f"Тип ошибки: {type(e)}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        return Response(
            {'error': 'Internal server error', 'detail': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_booking(request):
    """
    API endpoint для создания новой записи на занятие
    """
    try:
        hall_name = request.data.get('hall_name')
        date = request.data.get('date')
        time = request.data.get('time')

        if not all([hall_name, date, time]):
            return Response(
                {'error': 'Необходимо указать hall_name, date и time'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        hall = Hall.objects.get(name=hall_name)

        try:
            student = Student.objects.get(user=request.user)
        except Student.DoesNotExist:
            return Response(
                {'error': 'Только студенты могут создавать записи'}, 
                status=status.HTTP_403_FORBIDDEN
            )

        booking = Booking.objects.create(
            hall=hall,
            student=student,
            date=date,
            time_slot=time,
            status='PENDING'
        )

        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            "bookings",
            {
                "type": "booking_update",
                "data": {
                    "hall": hall_name,
                    "date": date,
                    "time": time
                }
            }
        )

        return Response({
            'message': 'Запись успешно создана',
            'booking': {
                'id': booking.id,
                'hall': hall_name,
                'date': date,
                'time': time
            }
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_booked_students(request):
    """
    Получение списка записанных студентов на конкретное время
    """
    try:
        date = request.GET.get('date')
        time_slot = request.GET.get('timeSlot')
        hall_name = request.GET.get('hallId')  

        logger.info(f"Получен запрос на список студентов:")
        logger.info(f"date: {date}")
        logger.info(f"time_slot: {time_slot}")
        logger.info(f"hall_name: {hall_name}")

        if not all([date, time_slot, hall_name]):
            return Response(
                {'error': 'Необходимо указать дату, время и зал'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            hall = Hall.objects.get(name=hall_name)
            logger.info(f"Найден зал: {hall.name} (id: {hall.id})")
        except Hall.DoesNotExist:
            logger.error(f"Зал не найден: {hall_name}")
            return Response(
                {'error': f'Зал не найден: {hall_name}'}, 
                status=status.HTTP_404_NOT_FOUND
            )

        # Получаем все записи на указанное время
        bookings = Booking.objects.filter(
            date=date,
            time_slot=time_slot,
            hall=hall
        ).select_related('student', 'student__user')

        logger.info(f"Найдено бронирований: {bookings.count()}")
        for booking in bookings:
            logger.info(f"Бронирование {booking.id}: {booking.student.user.full_name}, время: {booking.time_slot}")

        students_data = []
        for booking in bookings:
            student = booking.student
            students_data.append({
                'id': student.id,
                'name': student.user.full_name,
                'email': student.user.email,
                'group': student.group_name,
                'booking_id': booking.id,
                'status': booking.status
            })

        return Response(students_data, status=status.HTTP_200_OK)

    except Exception as e:
        logger.error(f"Ошибка при получении списка студентов: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        return Response(
            {'error': 'Произошла ошибка при получении списка студентов'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def get_hall_capacity(request):
    try:
        date = request.GET.get('date')
        time_slot = request.GET.get('timeSlot')
        hall_id = request.GET.get('hallId')

        if not all([date, time_slot, hall_id]):
            return JsonResponse({'error': 'Missing required parameters'}, status=400)

        # Конвертируем дату из строки в объект datetime
        booking_date = datetime.strptime(date, '%Y-%m-%d').date()

        # Получаем общее количество бронирований для данного зала и времени
        bookings_count = Booking.objects.filter(
            hall__name=hall_id,
            date=booking_date,
            time_slot=time_slot
        ).count()

        # Получаем максимальную вместимость зала
        hall = Hall.objects.get(name=hall_id)
        max_capacity = hall.capacity

        return JsonResponse({
            'current_capacity': bookings_count,
            'max_capacity': max_capacity
        })

    except Hall.DoesNotExist:
        return JsonResponse({'error': 'Hall not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_attendance(request):
    """
    Отметка посещаемости и начисление баллов студентам
    """
    if not hasattr(request.user, 'teacher_profile'):
        return Response(
            {'error': 'Доступ запрещен'}, 
            status=status.HTTP_403_FORBIDDEN
        )
        
    try:
        student_ids = request.data.get('student_ids', [])
        hall_name = request.data.get('hall_name')
        date = request.data.get('date')
        time_slot = request.data.get('time_slot')
        points = request.data.get('points', 2)  # По умолчанию 2 балла
        
        if not all([student_ids, hall_name, date, time_slot]):
            return Response(
                {'error': 'Не все обязательные поля заполнены'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        hall = Hall.objects.get(name=hall_name)
        teacher = request.user.teacher_profile
        updated_students = {}
        
        for student_id in student_ids:
            try:
                student = Student.objects.get(id=student_id)
                
                # Получаем или создаем запись о посещении
                booking, created = Booking.objects.get_or_create(
                    hall=hall,
                    student=student,
                    date=date,
                    time_slot=time_slot,
                    defaults={'status': 'PENDING'}
                )
                
                # Проверяем, не отмечен ли студент уже
                if booking.status == 'PRESENT':
                    continue
                    
                # Отмечаем присутствие
                booking.status = 'PRESENT'
                booking.marked_by = teacher
                booking.marked_at = timezone.now()
                booking.save()
                
                # Начисляем баллы
                points_history = PointsHistory.objects.create(
                    student=student,
                    points=points,
                    reason=f'Посещение {hall_name} {date} {time_slot}',
                    booking=booking,
                    awarded_by=teacher,
                    points_type='AUTO'
                )
                
                updated_students[student_id] = {
                    'points': points,
                    'booking_id': booking.id
                }
                
            except Student.DoesNotExist:
                continue
                
        return Response({
            'message': 'Посещаемость и баллы успешно сохранены',
            'updated_students': updated_students
        })
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )