@echo off
echo MISIS Sport Project Launcher
echo ========================

:: Проверяем, установлен ли Python
python --version > nul 2>&1
if errorlevel 1 (
    echo Python is not installed! Please install Python 3.8 or higher.
    start https://www.python.org/downloads/
    pause
    exit
)

:: Проверяем, установлен ли Node.js
node --version > nul 2>&1
if errorlevel 1 (
    echo Node.js is not installed! Please install Node.js 14 or higher.
    start https://nodejs.org/
    pause
    exit
)

:: Проверяем наличие виртуального окружения
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

:: Активируем виртуальное окружение и устанавливаем зависимости
echo Activating virtual environment...
call venv\Scripts\activate

:: Проверяем/устанавливаем зависимости Django
echo Checking Django dependencies...
cd django_react
pip install -r requirements.txt > nul 2>&1

:: Применяем миграции
echo Applying database migrations...
python manage.py migrate

:: Проверяем/устанавливаем зависимости Node.js
echo Checking React dependencies...
cd Frontend
if not exist "node_modules" (
    echo Installing React dependencies...
    npm install
)

:: Запускаем backend и frontend
echo Starting the application...
start cmd /k "cd ../.. && call venv\Scripts\activate && cd django_react && python manage.py runserver"
timeout /t 5 > nul
start cmd /k "cd ../../django_react/Frontend && npm start"

echo.
echo ========================
echo Project is starting...
echo - Backend will run on http://localhost:8000
echo - Frontend will run on http://localhost:3000
echo.
echo If the browser doesn't open automatically, please open http://localhost:3000 manually
echo To stop the project, close both command prompt windows
echo ========================
