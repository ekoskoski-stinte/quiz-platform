from django.db import models


class Question(models.Model):
    """
    Represents one item in the question bank.

    type       — determines how the question is displayed and graded.
    prompt     — the question text shown to the user.
    category   — e.g. "Geography", "Math", "Biology"
    difficulty — easy / medium / hard (for future filtering)
    correct_answer — used for text and numerical types; empty for choice types.
    """
    TYPE_CHOICES = [
        ("text", "Free Response"),
        ("single", "Single Choice"),
        ("multiple", "Multiple Choice"),
        ("numerical", "Numerical Input"),
        ("image", "Image Upload"),
    ]
    DIFFICULTY_CHOICES = [
        ("easy", "Easy"),
        ("medium", "Medium"),
        ("hard", "Hard"),
    ]

    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    prompt = models.TextField()
    category = models.CharField(max_length=100)
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default="medium")
    correct_answer = models.TextField(blank=True)  # text / numerical correct answer
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"[{self.type}] {self.prompt[:60]}"


class Choice(models.Model):
    """
    An answer option for single-choice and multiple-choice questions.
    A Question can have many Choices; each Choice belongs to one Question.
    This is a one-to-many relationship (FK from Choice → Question).
    """
    question = models.ForeignKey(Question, related_name="choices", on_delete=models.CASCADE)
    text = models.TextField()
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return f"{'✓' if self.is_correct else '✗'} {self.text[:40]}"