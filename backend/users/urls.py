from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import LoginView, RegistroUsuarioView

urlpatterns = [
    path('login/', LoginView.as_view(), name='api_login'),
    path('registro/', RegistroUsuarioView.as_view(), name='api_registro'),
    path('token/refresh/', TokenRefreshView.as_view(), name='api_token_refresh'),
]