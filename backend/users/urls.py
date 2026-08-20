from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import LoginView, RegistroUsuarioView, RequestOTPView, ResetPasswordOTPView

urlpatterns = [
    path('login/', LoginView.as_view(), name='api_login'),
    path('registro/', RegistroUsuarioView.as_view(), name='api_registro'),
    path('token/refresh/', TokenRefreshView.as_view(), name='api_token_refresh'),
    path('request-otp/', RequestOTPView.as_view(), name='request_otp'),
    path('reset-password-otp/', ResetPasswordOTPView.as_view(), name='reset_password_otp')
]