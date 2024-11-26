@echo off
echo Creating backup...

:: Создаем папку для бэкапов если её нет
if not exist "backups" mkdir backups

:: Получаем текущую дату для имени файла
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set datetime=%datetime:~0,8%_%datetime:~8,6%

:: Создаем папку для текущего бэкапа
set BACKUP_DIR=backups\backup_%datetime%
mkdir %BACKUP_DIR%

:: Копируем базу данных
echo Backing up database...
copy "django_react\db.sqlite3" "%BACKUP_DIR%\db.sqlite3"

:: Копируем медиафайлы
echo Backing up media files...
if exist "django_react\media" xcopy /E /I "django_react\media" "%BACKUP_DIR%\media"

:: Копируем важные конфигурационные файлы
echo Backing up configuration files...
copy "django_react\.env" "%BACKUP_DIR%\.env" 2>nul
copy "django_react\requirements.txt" "%BACKUP_DIR%\requirements.txt"

:: Создаем архив
echo Creating archive...
powershell Compress-Archive -Path "%BACKUP_DIR%" -DestinationPath "%BACKUP_DIR%.zip"

:: Удаляем временную папку
rmdir /S /Q "%BACKUP_DIR%"

echo Backup completed! Backup file: %BACKUP_DIR%.zip
pause
