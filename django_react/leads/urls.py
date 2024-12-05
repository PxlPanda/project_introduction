# leads/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views
from .views_booking import booking_view, booking_detail_view

router = DefaultRouter()
router.register(r'register', views.RegistrationView, basename='register')
router.register(r'locations', views.LocationViewSet)
router.register(r'halls', views.HallViewSet)
router.register(r'pinned-halls', views.PinnedHallViewSet, basename='pinned-halls')
router.register(r'points-history', views.PointsHistoryViewSet, basename='points-history')

urlpatterns = [
    path('', include(router.urls)),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('users/me/', views.current_user, name='current-user'),
    path('bookings/', booking_view, name='booking_view'),
    path('bookings/<int:booking_id>/', booking_detail_view, name='booking_detail'),
    path('student-data/', views.student_data, name='student-data'), 
    path('server-time/', views.server_time, name='server-time'),    

]
