# МИСИС Спорт

## Требования
- Python 3.8+
- Node.js 14+
- npm или yarn
- PostgreSQL (опционально)

## Установка и запуск

### Backend (Django)
1. Создайте виртуальное окружение:
```bash
python -m venv venv
```

2. Активируйте виртуальное окружение:
- Windows:
```bash
venv\Scripts\activate
```
- Linux/Mac:
```bash
source venv/bin/activate
```

3. Установите зависимости:
```bash
cd django_react
pip install -r requirements.txt
```

4. Примените миграции:
```bash
python manage.py migrate
```

5. Запустите сервер:
```bash
python manage.py runserver
```

### Frontend (React)
1. Перейдите в директорию Frontend:
```bash
cd django_react/Frontend
```

2. Установите зависимости:
```bash
npm install
```

3. Запустите приложение:
```bash
npm start
```

## Структура проекта
```
django_react/
├── Frontend/          # React приложение
├── django_react/      # Django проект
├── manage.py
└── requirements.txt   # Python зависимости
```

## Дополнительно
- База данных по умолчанию - SQLite
- Для production рекомендуется использовать PostgreSQL
- Все настройки находятся в django_react/settings.py
