from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Student, Teacher, Location, Hall, PinnedHall, Booking, PointsHistory

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'full_name']
        read_only_fields = ['id']

class TeacherSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email')
    full_name = serializers.CharField(source='user.full_name')

    class Meta:
        model = Teacher
        fields = ['id', 'email', 'full_name']

class StudentSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email')
    full_name = serializers.CharField(source='user.full_name')

    class Meta:
        model = Student
        fields = ['id', 'email', 'full_name', 'group_name', 'student_number', 'points']

class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ['id', 'name']

class HallSerializer(serializers.ModelSerializer):
    location_name = serializers.CharField(source='location.name', read_only=True)
    current_bookings_count = serializers.SerializerMethodField()

    class Meta:
        model = Hall
        fields = ['id', 'name', 'location', 'location_name', 'capacity', 'is_active', 'current_bookings_count']

    def get_current_bookings_count(self, obj):
        date = self.context.get('date')
        time_slot = self.context.get('time_slot')
        if date and time_slot:
            return obj.bookings.filter(date=date, time_slot=time_slot).count()
        return None

class PinnedHallSerializer(serializers.ModelSerializer):
    hall_details = HallSerializer(source='hall', read_only=True)

    class Meta:
        model = PinnedHall
        fields = ['id', 'hall', 'hall_details', 'order']

    def validate(self, data):
        user = self.context['request'].user
        if PinnedHall.objects.filter(user=user).count() >= 2 and not self.instance:
            raise serializers.ValidationError("Нельзя закрепить более двух залов")
        return data

class BookingCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ['hall', 'date', 'time_slot']

    def validate(self, data):
        user = self.context['request'].user
        if not hasattr(user, 'student_profile'):
            raise serializers.ValidationError("Только студенты могут создавать записи")

        # Проверка на существующую запись в это время
        existing_booking = Booking.objects.filter(
            student__user=user,
            date=data['date'],
            time_slot=data['time_slot']
        ).exists()
        if existing_booking:
            raise serializers.ValidationError("У вас уже есть запись на это время")

        # Проверка на количество мест в зале
        hall_bookings = Booking.objects.filter(
            hall=data['hall'],
            date=data['date'],
            time_slot=data['time_slot']
        ).count()
        if hall_bookings >= data['hall'].capacity:
            raise serializers.ValidationError("В зале нет свободных мест на это время")

        return data

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['student'] = user.student_profile
        return super().create(validated_data)

class BookingListSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.user.full_name', read_only=True)
    hall_name = serializers.CharField(source='hall.name', read_only=True)
    location_name = serializers.CharField(source='hall.location.name', read_only=True)

    class Meta:
        model = Booking
        fields = ['id', 'hall', 'hall_name', 'location_name', 'student_name', 
                 'date', 'time_slot', 'status', 'created_at', 'marked_at']

class PointsHistorySerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.user.full_name', read_only=True)
    awarded_by_name = serializers.CharField(source='awarded_by.user.full_name', read_only=True)

    class Meta:
        model = PointsHistory
        fields = ['id', 'student', 'student_name', 'points', 'reason', 
                 'date', 'booking', 'awarded_by', 'awarded_by_name']

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)
    is_teacher = serializers.BooleanField(required=True)
    group_name = serializers.CharField(required=False)
    student_number = serializers.CharField(required=False)

    class Meta:
        model = User
        fields = ['email', 'full_name', 'password', 'confirm_password', 
                 'is_teacher', 'group_name', 'student_number']

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError("Пароли не совпадают")
        
        if not data['is_teacher'] and (not data.get('group_name') or not data.get('student_number')):
            raise serializers.ValidationError("Для студента обязательны поля group_name и student_number")

        return data

    def create(self, validated_data):
        is_teacher = validated_data.pop('is_teacher')
        validated_data.pop('confirm_password')
        group_name = validated_data.pop('group_name', None)
        student_number = validated_data.pop('student_number', None)

        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            full_name=validated_data['full_name'],
            is_teacher=is_teacher,
            is_student=not is_teacher
        )

        if is_teacher:
            Teacher.objects.create(user=user)
        else:
            Student.objects.create(
                user=user,
                group_name=group_name,
                student_number=student_number
            )

        return user
