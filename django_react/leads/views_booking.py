from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Booking, Hall, Student
from django.utils import timezone
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def booking_view(request):
    """
    GET: Получение списка записей пользователя
    POST: Создание новой записи
    """
    if request.method == 'GET':
        try:
            # Получаем студента по текущему пользователю
            student = Student.objects.get(user=request.user)
            
            # Получаем все записи студента
            bookings = Booking.objects.filter(student=student).select_related('hall', 'hall__location')
            
            # Форматируем данные для ответа
            bookings_data = []
            for booking in bookings:
                bookings_data.append({
                    'id': booking.id,
                    'hall': {
                        'id': booking.hall.id,
                        'name': booking.hall.name,
                    },
                    'location': booking.hall.location.name,
                    'date': booking.date,
                    'time_slot': booking.time_slot.strftime('%H:%M'),
                    'status': booking.status
                })
            
            return Response({'bookings': bookings_data}, status=status.HTTP_200_OK)
            
        except Student.DoesNotExist:
            return Response(
                {'error': 'Student profile not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error in get_user_bookings: {str(e)}")
            return Response(
                {'error': 'Internal server error'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    elif request.method == 'POST':
        try:
            # Получаем данные из запроса
            hall_id = request.data.get('hall_id')
            date_str = request.data.get('date')
            time_slot_str = request.data.get('time_slot')
            location = request.data.get('location')
            
            logger.info(f"Creating booking with data: hall_id={hall_id}, date={date_str}, time_slot={time_slot_str}, location={location}")
            
            # Проверяем наличие всех необходимых данных
            if not all([hall_id, date_str, time_slot_str, location]):
                return Response(
                    {'error': 'Missing required fields'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Преобразуем строку времени в объект time
            try:
                time_slot = datetime.strptime(time_slot_str, '%H:%M').time()
                date = datetime.strptime(date_str, '%Y-%m-%d').date()
            except ValueError as e:
                logger.error(f"Error parsing date/time: {str(e)}")
                return Response(
                    {'error': 'Invalid date or time format'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Получаем студента
            student = Student.objects.get(user=request.user)
            
            # Получаем зал
            hall = Hall.objects.get(id=hall_id)
            
            # Проверяем, нет ли уже записи на это время
            existing_booking = Booking.objects.filter(
                student=student,
                date=date,
                time_slot=time_slot
            ).exists()
            
            if existing_booking:
                return Response(
                    {'error': 'You already have a booking at this time'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Создаем новую запись
            booking = Booking.objects.create(
                hall=hall,
                student=student,
                date=date,
                time_slot=time_slot,
                status='PENDING'
            )
            
            logger.info(f"Successfully created booking with ID: {booking.id}")
            
            # Формируем ответ
            response_data = {
                'id': booking.id,
                'hall': {
                    'id': hall.id,
                    'name': hall.name,
                },
                'location': hall.location.name,
                'date': booking.date,
                'time_slot': booking.time_slot.strftime('%H:%M'),
                'status': booking.status
            }
            
            return Response(response_data, status=status.HTTP_201_CREATED)
            
        except Student.DoesNotExist:
            return Response(
                {'error': 'Student profile not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Hall.DoesNotExist:
            return Response(
                {'error': 'Hall not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error in create_booking: {str(e)}")
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def booking_detail_view(request, booking_id):
    """
    DELETE: Удаление существующей записи
    """
    try:
        # Получаем студента по текущему пользователю
        student = Student.objects.get(user=request.user)
        
        # Получаем бронирование и проверяем, принадлежит ли оно текущему студенту
        booking = Booking.objects.get(id=booking_id, student=student)
        
        # Удаляем бронирование
        booking.delete()
        
        return Response(status=status.HTTP_204_NO_CONTENT)
        
    except Student.DoesNotExist:
        return Response(
            {'error': 'Student profile not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Booking.DoesNotExist:
        return Response(
            {'error': 'Booking not found or access denied'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error in delete_booking: {str(e)}")
        return Response(
            {'error': 'Internal server error'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
