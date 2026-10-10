from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    LoginView,
    RegistroUsuarioView,
    RequestOTPView,
    ResetPasswordOTPView,
    UsuarioAdminViewSet,
)

router = DefaultRouter()
router.register(r'usuarios', UsuarioAdminViewSet, basename='usuario-admin')

urlpatterns = [
    path('login/', LoginView.as_view(), name='api_login'),
    path('registro/', RegistroUsuarioView.as_view(), name='api_registro'),
    path('token/refresh/', TokenRefreshView.as_view(), name='api_token_refresh'),
    path('request-otp/', RequestOTPView.as_view(), name='request_otp'),
    path('reset-password-otp/', ResetPasswordOTPView.as_view(), name='reset_password_otp'),
    path('', include(router.urls)),
]