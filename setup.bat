@echo off
echo Installing MISIS Sport Project...

:: Создание виртуального окружения
echo Creating virtual environment...
python -m venv venv
call venv\Scripts\activate

:: Установка зависимостей backend
echo Installing backend dependencies...
cd django_react
pip install -r requirements.txt

:: Применение миграций
echo Applying migrations...
python manage.py migrate

:: Установка зависимостей frontend
echo Installing frontend dependencies...
cd Frontend
npm install

:: Сборка frontend
echo Building frontend...
npm run build

:: Возврат в корневую директорию
cd ..
cd ..

echo Setup completed!
echo.
echo To start the project:
echo 1. Open first terminal and run: cd django_react && python manage.py runserver
echo 2. Open second terminal and run: cd django_react/Frontend && npm start
pause
