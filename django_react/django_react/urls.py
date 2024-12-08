from django.urls import path, re_path, include
from django.views.static import serve
from django.conf import settings
from . import views
import os

urlpatterns = [
    # API endpoints
    path('api/server-time/', views.get_server_time, name='server_time'),
    path('api/students/', views.get_students, name='get_students'),
    path('api/save-points/', views.save_points, name='save_points'),
    path('api/mark-attendance/', views.mark_attendance, name='mark_attendance'),
    path('api/student-data/', views.get_student_data, name='student_data'),
    path('api/login/', views.login_api, name='login_api'),
    path('api/register-student/', views.register_student, name='register_student'),
    path('api/register-teacher/', views.register_teacher, name='register_teacher'),
    path('api/halls/', views.get_halls, name='get_halls'),
    path('api/booked-students/', views.get_booked_students, name='get_booked_students'),
    path('api/hall-capacity/', views.get_hall_capacity, name='get_hall_capacity'),
    
    # Leads app URLs
    path('leads/', include('leads.urls')),
    
    # Static files
    path('manifest.json', serve, {'document_root': settings.REACT_APP_DIR, 'path': 'public/manifest.json'}),
    path('logo192.png', serve, {'document_root': settings.REACT_APP_DIR, 'path': 'public/logo192.png'}),
    path('logo512.png', serve, {'document_root': settings.REACT_APP_DIR, 'path': 'public/logo512.png'}),
    path('favicon.ico', serve, {'document_root': settings.REACT_APP_DIR, 'path': 'public/favicon.ico'}),
    
    # React app catch-all - должен быть последним
    re_path(r'^(?!api/).*$', views.index, name='index'),
]

if settings.DEBUG:
    from django.conf.urls.static import static
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static('/', document_root=os.path.join(settings.REACT_APP_DIR, 'public'))