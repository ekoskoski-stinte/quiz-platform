#!/usr/bin/env bash
# Render build script — runs after pip install
set -e

echo "==> Running migrations..."
python manage.py migrate --noinput

echo "==> Collecting static files..."
python manage.py collectstatic --noinput

echo "==> Seeding question bank (skips if already seeded)..."
# Only seed if the bank is empty
COUNT=$(python manage.py shell -c "from apps.questions.models import Question; print(Question.objects.count())")
if [ "$COUNT" = "0" ]; then
    python manage.py seed
    echo "==> Seeded 25 questions."
else
    echo "==> Question bank already has $COUNT questions — skipping seed."
fi

echo "==> Build complete."
