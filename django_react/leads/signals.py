from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db import models
from .models import PointsHistory, Student

@receiver([post_save, post_delete], sender=PointsHistory)
def update_student_points(sender, instance, **kwargs):
    """
    Автоматически обновляет общее количество баллов студента при любых изменениях в истории баллов
    """
    student = instance.student
    total_points = PointsHistory.objects.filter(student=student).aggregate(
        models.Sum('points'))['points__sum'] or 0
    
    # Обновляем баллы студента только если они изменились
    if student.points != total_points:
        student.points = total_points
        student.save(update_fields=['points'])  # Обновляем только поле points
