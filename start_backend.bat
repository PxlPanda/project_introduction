@echo off
echo Starting Django Backend...
call venv\Scripts\activate
cd django_react
python manage.py runserver
