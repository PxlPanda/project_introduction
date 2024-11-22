# leads/urls.py

from django.urls import path
from . import views

urlpatterns = [
    # Получение списков
    path('students/', views.get_students, name='get_students'),
    path('teachers/', views.get_teachers, name='get_teachers'),
    
    # Создание записей
    path('create/student/', views.create_student, name='create_student'),
    path('create/teacher/', views.create_teacher, name='create_teacher'),
    
    # Новый эндпоинт для регистрации
    path('register/student/', views.register_student, name='register_student'),  # Для регистрации студента
    path('register/teacher/', views.register_teacher, name='register_teacher'),  # Для регистрации преподавателя
    
    # Обновление записей
    path('update/student/<int:student_id>/', views.update_student, name='update_student'),
    path('update/teacher/<int:teacher_id>/', views.update_teacher, name='update_teacher'),
    
    # Удаление записей
    path('delete/student/<int:student_id>/', views.delete_student, name='delete_student'),
    path('delete/teacher/<int:teacher_id>/', views.delete_teacher, name='delete_teacher'),
]
