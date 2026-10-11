from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView


class HealthCheckView(APIView):
    """
    Endpoint público para monitoreo de disponibilidad (uptime)
    y prevención de suspensión por inactividad en Render.
    """
    permission_classes = [AllowAny]

    def get(self, request) -> Response:
        return Response({"status": "healthy"}, status=status.HTTP_200_OK)