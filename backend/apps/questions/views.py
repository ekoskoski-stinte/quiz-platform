from rest_framework import viewsets, permissions
from rest_framework.response import Response
from .models import Question
from .serializers import QuestionSerializer, QuestionListSerializer


class IsQuizAdmin(permissions.BasePermission):
    """
    Custom permission: only users with is_admin=True can write.
    This is separate from Django's is_staff — a user can be a quiz admin
    without having access to the Django admin panel.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        return request.user.is_authenticated and request.user.is_admin


class QuestionViewSet(viewsets.ModelViewSet):
    """
    Handles all CRUD for questions:
      GET    /api/questions/        → list all
      POST   /api/questions/        → create (admin only)
      GET    /api/questions/{id}/   → retrieve one
      PUT    /api/questions/{id}/   → update (admin only)
      DELETE /api/questions/{id}/   → delete (admin only)
    """
    queryset = Question.objects.prefetch_related("choices").all().order_by("-created_at")
    permission_classes = [IsQuizAdmin]

    def get_serializer_class(self):
        # Admins get the full serializer (with is_correct); players get the masked one
        if self.request.user.is_admin or self.action in ["create", "update", "partial_update"]:
            return QuestionSerializer
        return QuestionListSerializer