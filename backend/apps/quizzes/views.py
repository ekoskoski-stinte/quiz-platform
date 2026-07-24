import random
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.questions.models import Question, Choice
from .grading import grade_answer
from .models import Answer, Attempt
from .serializers import AttemptListSerializer, AttemptSerializer


QUIZ_SIZE = 5  # number of questions per attempt


class AttemptViewSet(viewsets.ModelViewSet):
    """
    GET    /api/attempts/           → list current user's attempts
    POST   /api/attempts/           → start a new attempt (returns 5 random questions)
    GET    /api/attempts/{id}/      → retrieve attempt detail (for review)
    POST   /api/attempts/{id}/submit/ → submit answers, trigger grading
    """
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Users only see their own attempts
        return Attempt.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.action == "list":
            return AttemptListSerializer
        return AttemptSerializer

    def create(self, request):
        """Start a new quiz: pick QUIZ_SIZE random questions."""
        all_questions = list(Question.objects.all())
        if len(all_questions) < QUIZ_SIZE:
            return Response(
                {"error": f"Not enough questions in the bank. Need at least {QUIZ_SIZE}."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        selected = random.sample(all_questions, QUIZ_SIZE)
        attempt = Attempt.objects.create(user=request.user)
        attempt.questions.set(selected)
        return Response(AttemptSerializer(attempt, context={"request": request}).data,
                        status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], url_path="submit")
    def submit(self, request, pk=None):
        """
        Submit all answers for an attempt.
        Body: multipart/form-data with answers as JSON string + optional image files.

        Expected body structure:
        {
          "answers": [
            {"question_id": 1, "selected_choice_ids": [3]},
            {"question_id": 2, "text_response": "Some text"},
            ...
          ]
        }
        Image responses come as separate files keyed by question_id:
          image_<question_id>: <file>
        """
        attempt = self.get_object()
        if attempt.submitted_at:
            return Response({"error": "Attempt already submitted."}, status=400)

        import json
        raw_answers = request.data.get("answers", "[]")
        if isinstance(raw_answers, str):
            try:
                answers_data = json.loads(raw_answers)
            except json.JSONDecodeError:
                return Response({"error": "Invalid answers JSON."}, status=400)
        else:
            answers_data = raw_answers

        question_ids = list(attempt.questions.values_list("id", flat=True))
        correct_count = 0
        total_graded = 0

        for ans_data in answers_data:
            q_id = ans_data.get("question_id")
            if q_id not in question_ids:
                continue  # ignore answers for questions not in this attempt

            question = Question.objects.get(pk=q_id)
            answer, _ = Answer.objects.get_or_create(attempt=attempt, question=question)

            # Save response
            answer.text_response = ans_data.get("text_response", "")
            image_file = request.FILES.get(f"image_{q_id}")
            if image_file:
                answer.image_response = image_file

            choice_ids = ans_data.get("selected_choice_ids", [])
            if choice_ids:
                answer.selected_choices.set(
                    Choice.objects.filter(id__in=choice_ids, question=question)
                )

            answer.save()

            # Grade
            result = grade_answer(answer)
            answer.is_correct = result["is_correct"]
            answer.ai_feedback = result["ai_feedback"]
            answer.graded_at = timezone.now()
            answer.save()

            if result["is_correct"] is True:
                correct_count += 1
            if result["is_correct"] is not None:
                total_graded += 1

        # Score = number of correct answers (0–5)
        attempt.score = float(correct_count)
        attempt.submitted_at = timezone.now()
        attempt.save()

        return Response(AttemptSerializer(attempt, context={"request": request}).data)