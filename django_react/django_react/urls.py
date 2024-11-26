from django.urls import path, re_path, include
from django.views.static import serve
from . import views
from django.conf import settings
from rest_framework_simplejwt.views import TokenRefreshView
import os

urlpatterns = [
    # API endpoints
    path('api/server-time/', views.get_server_time, name='server_time'),
    path('api/students/', views.get_students, name='get_students'),
    path('api/save-points/', views.save_points, name='save_points'),
    path('api/login/', views.login_api, name='login'),  # Убедимся, что этот URL здесь
    path('api/register-teacher/', views.register_teacher, name='register_teacher'),
    path('api/register-student/', views.register_student, name='register-student'),
    
    # Static files
    path('manifest.json', views.serve_manifest, name='serve_manifest'),
    path('logo192.png', lambda request: serve(request, os.path.join('public', 'logo192.png'), document_root=settings.REACT_APP_DIR)),
    path('logo512.png', lambda request: serve(request, os.path.join('public', 'logo512.png'), document_root=settings.REACT_APP_DIR)),
    path('favicon.ico', lambda request: serve(request, os.path.join('public', 'favicon.ico'), document_root=settings.REACT_APP_DIR)),
    
    # React app catch-all - должен быть последним
    re_path(r'^(?!api/).*$', views.index, name='index'),
]

if settings.DEBUG:
    from django.conf.urls.static import static
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static('/', document_root=os.path.join(settings.REACT_APP_DIR, 'public'))