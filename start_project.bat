@echo off
echo MISIS Sport Project Launcher
echo ========================

:: Проверяем права администратора
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo This script requires administrator privileges.
    echo Please run this script as administrator.
    echo Right-click on the script and select "Run as administrator"
    pause
    exit
)

:: Проверяем, установлен ли Chocolatey
where choco >nul 2>&1
if errorlevel 1 (
    echo Installing Chocolatey...
    powershell -NoProfile -ExecutionPolicy Bypass -Command "iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))" && SET PATH=%PATH%;%ALLUSERSPROFILE%\chocolatey\bin
    
    :: Проверяем успешность установки
    where choco >nul 2>&1
    if errorlevel 1 (
        echo Failed to install Chocolatey. Please install it manually from https://chocolatey.org/install
        pause
        exit
    )
    echo Chocolatey installed successfully!
    timeout /t 5 /nobreak
)

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

:: Проверяем, установлен ли Make
make --version > nul 2>&1
if errorlevel 1 (
    echo Installing Make using Chocolatey...
    :: Проверяем, установлен ли Chocolatey
    where choco > nul 2>&1
    if errorlevel 1 (
        echo Installing Chocolatey...
        @powershell -NoProfile -ExecutionPolicy Bypass -Command "iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))"
        :: Обновляем PATH
        set "PATH=%PATH%;%ALLUSERSPROFILE%\chocolatey\bin"
    )
    :: Устанавливаем Make
    choco install make -y
)

:: Проверяем наличие виртуального окружения
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

:: Активируем виртуальное окружение и устанавливаем зависимости
echo Activating virtual environment...
call venv\Scripts\activate

:: Устанавливаем django-cors-headers и другие зависимости
echo Installing Django dependencies...
cd django_react
pip install django-cors-headers
pip install djangorestframework
pip install djangorestframework-simplejwt
pip install channels
pip install channels-redis
pip install django-rest-framework
pip install python-dotenv
pip install -r requirements.txt

:: Проверяем настройки CORS в settings.py
echo Checking CORS settings...
python -c "from django.conf import settings; print('CORS_ALLOW_ALL_ORIGINS' in dir(settings))" > cors_check.txt
set /p CORS_CONFIGURED=<cors_check.txt
del cors_check.txt

if not "%CORS_CONFIGURED%"=="True" (
    echo Configuring CORS settings...
    echo. >> django_react/settings.py
    echo CORS_ALLOW_ALL_ORIGINS = True >> django_react/settings.py
    echo CORS_ALLOW_CREDENTIALS = True >> django_react/settings.py
    
    :: Добавляем corsheaders в INSTALLED_APPS если его там нет
    python -c "with open('django_react/settings.py', 'r') as f: content = f.read(); print('corsheaders' not in content)" > cors_app_check.txt
    set /p CORS_APP_NEEDED=<cors_app_check.txt
    del cors_app_check.txt
    
    if "%CORS_APP_NEEDED%"=="True" (
        python -c "with open('django_react/settings.py', 'r') as f: content = f.readlines(); content.insert([i for i, line in enumerate(content) if 'INSTALLED_APPS' in line][0] + 1, '    \"corsheaders\",\n'); open('django_react/settings.py', 'w').writelines(content)"
    )
)

:: Применяем миграции
echo Applying database migrations...
python manage.py migrate

:: Проверяем/устанавливаем зависимости Node.js
echo Checking React dependencies...
cd Frontend
if not exist "node_modules" (
    echo Installing React dependencies...
    npm install
    npm install @material-ui/core
    npm install @material-ui/icons
    npm install @emotion/react
    npm install @emotion/styled
    npm install axios
    npm install react-router-dom
    npm install date-fns
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
