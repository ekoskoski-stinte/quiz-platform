from django.contrib import admin
from .models import Attempt, Answer

class AnswerInline(admin.TabularInline):
    model = Answer
    extra = 0
    readonly_fields = ["question", "text_response", "is_correct", "ai_feedback"]

@admin.register(Attempt)
class AttemptAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "score", "started_at", "submitted_at"]
    inlines = [AnswerInline]