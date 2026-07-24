from django.conf import settings
from django.db import models


class Attempt(models.Model):
    """
    One quiz session for one user.
    - questions: the 5 randomly selected questions for this attempt (ManyToMany)
    - score: calculated after submission (0.0–5.0)
    - submitted_at: null until the user submits
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="attempts",
    )
    questions = models.ManyToManyField("questions.Question", blank=True)
    started_at = models.DateTimeField(auto_now_add=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    score = models.FloatField(null=True, blank=True)

    class Meta:
        ordering = ["-started_at"]

    def __str__(self):
        return f"Attempt #{self.pk} by {self.user.username} — score: {self.score}"


class Answer(models.Model):
    """
    One user's response to one question within one attempt.

    For choice questions → selected_choices (ManyToMany to Choice)
    For text/numerical  → text_response (plain string)
    For image           → image_response (file upload)

    is_correct: True/False after grading, None if not yet graded.
    ai_feedback: GPT explanation (empty string = not applicable or stubbed).
    """
    attempt = models.ForeignKey(Attempt, related_name="answers", on_delete=models.CASCADE)
    question = models.ForeignKey("questions.Question", on_delete=models.CASCADE)

    text_response = models.TextField(blank=True)
    image_response = models.ImageField(upload_to="answers/", null=True, blank=True)
    selected_choices = models.ManyToManyField("questions.Choice", blank=True)

    is_correct = models.BooleanField(null=True, blank=True)  # None = not yet graded
    ai_feedback = models.TextField(blank=True)
    graded_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = [("attempt", "question")]  # one answer per question per attempt

    def __str__(self):
        return f"Answer to Q#{self.question_id} in Attempt #{self.attempt_id}"