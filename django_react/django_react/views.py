from rest_framework.decorators import api_view
from rest_framework.response import Response
from leads.serializers import TeacherSerializer, StudentSerializer
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import render

# Функция для главной страницы
def index(request):
    return render(request, 'index.html')  # Замените на путь к вашему шаблону


from django.http import JsonResponse  # Для явного формирования ответа

@api_view(['POST'])
def register_teacher(request):
    if request.method == 'POST':
        print("Полученные данные для преподавателя:", request.data)  # Логируем полученные данные
        serializer = TeacherSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            print("Преподаватель сохранен в базе данных:", serializer.data)
            return JsonResponse({
                'message': 'Преподаватель успешно зарегистрирован!',
                'status': 'success'
            }, status=201)
        print("Ошибки сериализации преподавателя:", serializer.errors)
        return JsonResponse({
            'message': 'Ошибка регистрации преподавателя!',
            'status': 'error',
            'errors': serializer.errors
        }, status=400)

@api_view(['POST'])
def register_student(request):
    if request.method == 'POST':
        print("Полученные данные для студента:", request.data)  # Логируем полученные данные
        serializer = StudentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            print("Студент сохранен в базе данных:", serializer.data)
            return JsonResponse({
                'message': 'Студент успешно зарегистрирован!',
                'status': 'success'
            }, status=201)
        print("Ошибки сериализации студента:", serializer.errors)
        return JsonResponse({
            'message': 'Ошибка регистрации студента!',
            'status': 'error',
            'errors': serializer.errors
        }, status=400)
