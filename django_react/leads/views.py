# leads/views.py

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, Teacher, Student
from .serializers import UserSerializer, TeacherSerializer, StudentSerializer

from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from datetime import datetime, timedelta
from django.db.models import Count
from .models import (
    Student, Teacher, Location, Hall, PinnedHall, 
    Booking, PointsHistory, User
)
from .serializers import (
    StudentSerializer, TeacherSerializer, LocationSerializer,
    HallSerializer, PinnedHallSerializer, BookingCreateSerializer,
    BookingListSerializer, PointsHistorySerializer, UserRegistrationSerializer
)

class IsTeacher(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_teacher

class IsStudent(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_student

class RegistrationView(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]

    def create(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LocationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    permission_classes = [permissions.IsAuthenticated]

class HallViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Hall.objects.filter(is_active=True)
    serializer_class = HallSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']

    def get_queryset(self):
        queryset = super().get_queryset()
        location = self.request.query_params.get('location', None)
        
        if location:
            queryset = queryset.filter(location__name=location)

        return queryset

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['date'] = self.request.query_params.get('date')
        return context

    def get_time_slots(self, location_name):
        if location_name == "Горный":
            return [
                "09:00-10:35",
                "10:50-12:25",
                "12:40-14:15",
                "14:30-16:06",
                "16:30-18:05",
                "18:20-20:00"
            ]
        else:  # Беляево
            return [
                "08:30-10:00",
                "10:10-11:40",
                "11:50-13:20",
                "13:30-15:00"
            ]

    @action(detail=False, methods=['get'])
    def available_halls(self, request):
        try:
            print("Getting available halls...")
            halls_data = {
                'gorny': [],
                'belyaevo': []
            }
            
            # Получаем все залы
            halls = Hall.objects.select_related('location').all()
            print(f"Found {halls.count()} halls")
            
            for hall in halls:
                print(f"Processing hall: {hall.name} in {hall.location.name}")
                location_key = 'gorny' if hall.location.name == 'Горный' else 'belyaevo'
                time_slots = self.get_time_slots(hall.location.name)
                
                # Получаем все бронирования для этого зала на сегодня
                bookings = Booking.objects.filter(
                    hall=hall,
                    date=timezone.now().date()
                )
                
                # Создаем словарь занятости по временным слотам
                time_slot_capacity = {}
                for time_slot in time_slots:
                    current_bookings = bookings.filter(time_slot=time_slot.split('-')[0]).count()
                    time_slot_capacity[time_slot] = {
                        'current': current_bookings,
                        'max': hall.capacity
                    }
                
                hall_data = {
                    'id': hall.id,
                    'name': hall.name,
                    'capacity': hall.capacity,
                    'timeSlots': time_slots,
                    'timeSlotCapacity': time_slot_capacity
                }
                
                halls_data[location_key].append(hall_data)
                print(f"Added hall data for {hall.name}")
            
            print("Final halls data:", halls_data)
            return Response(halls_data)
            
        except Exception as e:
            print("Error in available_halls:", str(e))
            return Response({'error': str(e)}, status=400)

class PinnedHallViewSet(viewsets.ModelViewSet):
    serializer_class = PinnedHallSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return PinnedHall.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class BookingViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['student__user__full_name']

    def get_queryset(self):
        user = self.request.user
        if user.is_teacher:
            # Преподаватели видят все записи
            return Booking.objects.all()
        else:
            # Студенты видят только свои записи
            return Booking.objects.filter(student__user=user)

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return BookingCreateSerializer
        return BookingListSerializer

    @action(detail=True, methods=['post'], permission_classes=[IsTeacher])
    def mark_attendance(self, request, pk=None):
        booking = self.get_object()
        status = request.data.get('status')
        
        if status not in ['PRESENT', 'ABSENT']:
            return Response(
                {'error': 'Неверный статус'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Проверяем, прошло ли больше 25 минут от начала пары
        time_diff = timezone.now().time() > (
            datetime.strptime(str(booking.time_slot), '%H:%M:%S') + timedelta(minutes=25)
        ).time()

        if status == 'ABSENT' and not time_diff:
            return Response(
                {'error': 'Нельзя отметить отсутствие раньше чем через 25 минут после начала пары'},
                status=status.HTTP_400_BAD_REQUEST
            )

        booking.status = status
        booking.marked_by = request.user.teacher_profile
        booking.marked_at = timezone.now()
        booking.save()

        # Если студент присутствует, начисляем 10 баллов
        if status == 'PRESENT':
            PointsHistory.objects.create(
                student=booking.student,
                points=10,
                reason='Присутствие на занятии',
                booking=booking,
                awarded_by=request.user.teacher_profile
            )

        return Response({'status': 'updated'})

    @action(detail=True, methods=['post'], permission_classes=[IsTeacher])
    def remove_absent(self, request, pk=None):
        booking = self.get_object()
        
        # Проверяем, прошло ли больше 25 минут от начала пары
        time_diff = timezone.now().time() > (
            datetime.strptime(str(booking.time_slot), '%H:%M:%S') + timedelta(minutes=25)
        ).time()

        if not time_diff:
            return Response(
                {'error': 'Нельзя удалить запись раньше чем через 25 минут после начала пары'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if booking.status != 'ABSENT':
            return Response(
                {'error': 'Можно удалять только отсутствующих студентов'},
                status=status.HTTP_400_BAD_REQUEST
            )

        booking.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class PointsHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PointsHistorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_teacher:
            return PointsHistory.objects.all()
        else:
            return PointsHistory.objects.filter(student__user=user)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    email = request.data.get('email')
    password = request.data.get('password')
    user_type = request.data.get('user_type')

    if not email or not password:
        return Response({'error': 'Please provide both email and password'}, 
                        status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(email=email, password=password)

    if user is None:
        return Response({'error': 'Invalid credentials'}, 
                        status=status.HTTP_401_UNAUTHORIZED)

    if user_type == 'teacher' and not user.is_teacher:
        return Response({'error': 'User is not a teacher'}, 
                        status=status.HTTP_403_FORBIDDEN)
    elif user_type == 'student' and not user.is_student:
        return Response({'error': 'User is not a student'}, 
                        status=status.HTTP_403_FORBIDDEN)

    refresh = RefreshToken.for_user(user)
    return Response({
        'token': str(refresh.access_token),
        'refresh': str(refresh),
        'user': {
            'id': user.id,
            'email': user.email,
            'full_name': user.full_name,
            'is_teacher': user.is_teacher,
            'is_student': user.is_student
        }
    })

@api_view(['POST'])
@permission_classes([AllowAny])
def register_teacher(request):
    serializer = TeacherSerializer(data=request.data)
    if serializer.is_valid():
        teacher = serializer.save()
        refresh = RefreshToken.for_user(teacher.user)
        return Response({
            'token': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(teacher.user).data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def register_student(request):
    serializer = StudentSerializer(data=request.data)
    if serializer.is_valid():
        student = serializer.save()
        refresh = RefreshToken.for_user(student.user)
        return Response({
            'token': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(student.user).data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_students(request):
    students = Student.objects.all()
    serializer = StudentSerializer(students, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_teachers(request):
    teachers = Teacher.objects.all()
    serializer = TeacherSerializer(teachers, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_data(request):
    """
    Получение данных студента
    """
    try:
        student = Student.objects.get(user=request.user)
        serializer = StudentSerializer(student)
        return Response(serializer.data)
    except Student.DoesNotExist:
        return Response(
            {'error': 'Student profile not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['GET'])
def server_time(request):
    """
    Получение текущего времени сервера
    """
    return Response({
        'server_time': timezone.now().strftime('%Y-%m-%d %H:%M:%S')
    })

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
            # Преобразуем строку времени в объект time
            time_obj = datetime.strptime(time_slot, '%H:%M').time()
            logger.info(f"Преобразованное время: {time_obj}")
            
            # Преобразуем строку даты в объект date
            date_obj = datetime.strptime(date, '%Y-%m-%d').date()
            logger.info(f"Преобразованная дата: {date_obj}")
        except ValueError as e:
            logger.error(f"Ошибка преобразования даты/времени: {str(e)}")
            return Response(
                {'error': f'Неверный формат даты или времени: {str(e)}'}, 
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
            date=date_obj,
            time_slot=time_obj,
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
