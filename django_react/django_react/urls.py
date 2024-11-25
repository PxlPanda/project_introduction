from django.urls import path, re_path, include
from django.views.static import serve
from . import views
from django.conf import settings
from rest_framework_simplejwt.views import TokenRefreshView
import os

urlpatterns = [
    # API endpoints
    path('api/', include('leads.urls')),  # Включаем все URL из leads.urls
    
    # JWT refresh token endpoint
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Static files
    path('manifest.json', views.serve_manifest, name='serve_manifest'),
    path('logo192.png', lambda request: serve(request, os.path.join('public', 'logo192.png'), document_root=settings.REACT_APP_DIR)),
    path('logo512.png', lambda request: serve(request, os.path.join('public', 'logo512.png'), document_root=settings.REACT_APP_DIR)),
    path('favicon.ico', lambda request: serve(request, os.path.join('public', 'favicon.ico'), document_root=settings.REACT_APP_DIR)),
    
    # React app catch-all
    re_path(r'^.*$', views.index, name='index'),
]

if settings.DEBUG:
    from django.conf.urls.static import static
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static('/', document_root=os.path.join(settings.REACT_APP_DIR, 'public'))