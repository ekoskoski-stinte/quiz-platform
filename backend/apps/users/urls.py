from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import RegisterView, MeView, GuestLoginView

urlpatterns = [
    path("register/", RegisterView.as_view()),
    path("login/", TokenObtainPairView.as_view()),     # POST: {username, password} → {access, refresh}
    path("refresh/", TokenRefreshView.as_view()),       # POST: {refresh} → {access}
    path("me/", MeView.as_view()),
    path("guest/", GuestLoginView.as_view()),  # anonymous login                      # GET: current user info
]