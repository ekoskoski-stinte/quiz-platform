from rest_framework import serializers
from apps.questions.serializers import QuestionListSerializer
from .models import Attempt, Answer


class AnswerInputSerializer(serializers.Serializer):
    """Used when the user submits answers — not tied to a model directly."""
    question_id = serializers.IntegerField()
    text_response = serializers.CharField(required=False, allow_blank=True, default="")
    selected_choice_ids = serializers.ListField(
        child=serializers.IntegerField(), required=False, default=list
    )
    # image is handled separately as a file upload (multipart/form-data)


class AnswerSerializer(serializers.ModelSerializer):
    question = QuestionListSerializer(read_only=True)
    selected_choices = serializers.SerializerMethodField()
    correct_choices = serializers.SerializerMethodField()

    class Meta:
        model = Answer
        fields = [
            "id", "question", "text_response", "image_response",
            "selected_choices", "correct_choices",
            "is_correct", "ai_feedback", "graded_at",
        ]

    def get_selected_choices(self, obj):
        return [{"id": c.id, "text": c.text} for c in obj.selected_choices.all()]

    def get_correct_choices(self, obj):
        """Show the correct choices when reviewing a submitted attempt."""
        return [
            {"id": c.id, "text": c.text}
            for c in obj.question.choices.filter(is_correct=True)
        ]


class AttemptSerializer(serializers.ModelSerializer):
    questions = QuestionListSerializer(many=True, read_only=True)
    answers = AnswerSerializer(many=True, read_only=True)

    class Meta:
        model = Attempt
        fields = [
            "id", "questions", "answers",
            "started_at", "submitted_at", "score",
        ]


class AttemptListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for the history list — no questions or answers."""
    class Meta:
        model = Attempt
        fields = ["id", "started_at", "submitted_at", "score"]