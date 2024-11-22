from django.urls import path
from . import views
from . import settings

urlpatterns = [
    path('', views.index, name='index'),
    path('signin/', views.signin, name='signin'),
    path('login/', views.login_user, name='login_user'),
    path('static/<path:path>', views.serve_static, name='static'),  # Обработчик для статики
    path('api/halls/', views.get_halls, name='get_halls'),
    path('api/register/teacher/', views.register_teacher, name='register_teacher'),
    path('api/register/student/', views.register_student, name='register_student'),
]

if settings.DEBUG:
    from django.conf.urls.static import static
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)