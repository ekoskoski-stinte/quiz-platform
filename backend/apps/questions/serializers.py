from rest_framework import serializers
from .models import Question, Choice


class ChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ["id", "text", "is_correct"]


class QuestionSerializer(serializers.ModelSerializer):
    """
    Handles nested choices — when you create/update a question via the API,
    you can include its choices in the same request body.
    """
    choices = ChoiceSerializer(many=True, required=False)

    class Meta:
        model = Question
        fields = [
            "id", "type", "prompt", "category", "difficulty",
            "correct_answer", "choices", "created_at", "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]

    def validate(self, data):
        """
        Enforce per-type validation rules from the spec.
        """
        q_type = data.get("type", getattr(self.instance, "type", None))
        choices = data.get("choices", [])
        correct_answer = data.get("correct_answer", "")

        if q_type == "single":
            correct = [c for c in choices if c.get("is_correct")]
            if len(correct) != 1:
                raise serializers.ValidationError("Single choice must have exactly one correct answer.")

        elif q_type == "multiple":
            correct = [c for c in choices if c.get("is_correct")]
            if len(correct) < 1:
                raise serializers.ValidationError("Multiple choice must have at least one correct answer.")

        elif q_type == "numerical":
            try:
                float(correct_answer)
            except (ValueError, TypeError):
                raise serializers.ValidationError("Numerical questions must have a numeric correct_answer.")

        elif q_type == "text":
            if not correct_answer.strip():
                raise serializers.ValidationError("Text questions must have a non-empty correct_answer.")

        return data

    def create(self, validated_data):
        choices_data = validated_data.pop("choices", [])
        question = Question.objects.create(**validated_data)
        for c in choices_data:
            Choice.objects.create(question=question, **c)
        return question

    def update(self, instance, validated_data):
        choices_data = validated_data.pop("choices", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if choices_data is not None:
            # Replace all choices on update
            instance.choices.all().delete()
            for c in choices_data:
                Choice.objects.create(question=instance, **c)

        return instance


class QuestionListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views — omits choice correctness for players."""
    choices = serializers.SerializerMethodField()

    class Meta:
        model = Question
        fields = ["id", "type", "prompt", "category", "difficulty", "choices"]

    def get_choices(self, obj):
        # For non-admins, hide which choice is correct
        request = self.context.get("request")
        if request and hasattr(request.user, "is_admin") and request.user.is_admin:
            return ChoiceSerializer(obj.choices.all(), many=True).data
        # Players only see the text, not is_correct
        return [{"id": c.id, "text": c.text} for c in obj.choices.all()]