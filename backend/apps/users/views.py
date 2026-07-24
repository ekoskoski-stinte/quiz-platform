import uuid

from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User
from .serializers import RegisterSerializer, UserSerializer


class RegisterView(generics.CreateAPIView):
    """
    POST /api/auth/register/
    Open to anyone — creates a new named user account.
    """
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


class MeView(APIView):
    """
    GET /api/auth/me/
    Returns the currently logged-in user's profile.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


class GuestLoginView(APIView):
    """
    POST /api/auth/guest/
    Creates an anonymous guest account and returns JWT tokens.
    No username or password required. The client gets a real JWT
    and all downstream auth works identically to a normal login.
    Guest accounts have unusable passwords — they can never log in
    with credentials, only via the token issued here.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        username = f"guest_{uuid.uuid4().hex[:10]}"
        user = User.objects.create_user(username=username)
        user.set_unusable_password()
        user.save()

        refresh = RefreshToken.for_user(user)
        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "username": username,
            "is_guest": True,
        })
