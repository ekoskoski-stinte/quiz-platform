from django.contrib import admin
from .models import Question, Choice

class ChoiceInline(admin.TabularInline):
    model = Choice
    extra = 2

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ["prompt", "type", "category", "difficulty", "created_at"]
    list_filter = ["type", "difficulty", "category"]
    inlines = [ChoiceInline]