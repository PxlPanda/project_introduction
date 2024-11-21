from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from . import views

urlpatterns = [
    path('api/register/teacher/', views.register_teacher),
    path('api/register/student/', views.register_student),
]

# Обслуживание статических файлов (включая manifest.json) в режиме разработки
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# Если файлы находятся в других местах или вам нужно добавить дополнительные URL для обслуживания фронтенда, можно настроить их здесь
