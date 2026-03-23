import os

from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.conf import settings
from django.contrib.auth import get_user_model

from .serializers import RegisterSerializer, UserSerializer

User = get_user_model()

AVATARS_DIR = os.path.join(settings.BASE_DIR, 'assets', 'avatars')


class RegisterView(generics.CreateAPIView):
    """POST /api/auth/register/ - create a new user."""
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class MeView(APIView):
    """
    GET  /api/auth/me/  - return the current user's profile.
    PATCH /api/auth/me/ - update the current user's profile.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class AvatarListView(APIView):
    """GET /api/auth/avatars/ - list all available avatar options."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        try:
            files = sorted(
                f for f in os.listdir(AVATARS_DIR)
                if f.lower().endswith(('.png', '.jpg', '.jpeg', '.svg', '.webp'))
            )
        except FileNotFoundError:
            files = []
        return Response([
            {'filename': f, 'url': f'/avatars/{f}'}
            for f in files
        ])
