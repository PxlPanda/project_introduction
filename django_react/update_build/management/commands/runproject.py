from django.core.management.base import BaseCommand
from django.core.management import call_command

class Command(BaseCommand):
    help = "Запускает Django-сервер"

    def handle(self, *args, **kwargs):
        # Запуск Django-сервера
        self.stdout.write("Запуск Django-сервера...")
        call_command("runserver")
