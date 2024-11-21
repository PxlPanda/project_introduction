import os
import subprocess
import shutil
from django.core.management.base import BaseCommand

# Пути
FRONTEND_DIR = os.path.join(os.getcwd(), "Frontend")  # Путь к React-приложению
BUILD_DIR = os.path.join(FRONTEND_DIR, "build")  # Папка сборки React
DJANGO_BUILD_DIR = os.path.join(os.getcwd(), "django_react", "build")  # Куда копировать сборку

class Command(BaseCommand):
    help = "Пересобирает React-приложение и запускает Django-сервер"

    def handle(self, *args, **kwargs):
        # Сборка React
        self.stdout.write("Запуск сборки React...")
        result = subprocess.run(["npm", "run", "build"], cwd=FRONTEND_DIR, shell=True)

        if result.returncode != 0:
            self.stderr.write("Ошибка сборки React!")
            return

        # Копирование файлов сборки
        self.stdout.write("Копирование файлов сборки в Django...")
        if os.path.exists(DJANGO_BUILD_DIR):
            shutil.rmtree(DJANGO_BUILD_DIR)
        shutil.copytree(BUILD_DIR, DJANGO_BUILD_DIR)

        self.stdout.write(self.style.SUCCESS("React успешно собран и перенесен в Django!"))

        # Запуск Django-сервера
        self.stdout.write("Запуск Django-сервера...")
        subprocess.run(["python", "manage.py", "runserver"])
