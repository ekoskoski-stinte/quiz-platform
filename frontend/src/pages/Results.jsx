import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../api/client'

function AnswerReview({ answer }) {
  const q = answer.question
  const icon = answer.is_correct === true ? '✅' : answer.is_correct === false ? '❌' : '⏳'

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
      <div className="flex items-start gap-3">
        <span className="text-xl" aria-label={answer.is_correct ? 'Correct' : 'Incorrect'}>{icon}</span>
        <div className="flex-1">
          <p className="font-medium text-gray-900">{q.prompt}</p>
          <div className="flex gap-2 mt-1 flex-wrap">
            <span className="text-xs bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">{q.category}</span>
            <span className="text-xs bg-gray-100 text-gray-500 rounded-full px-2 py-0.5 capitalize">{q.type}</span>
          </div>
        </div>
      </div>

      {/* User's answer */}
      {(q.type === 'text' || q.type === 'numerical') && answer.text_response && (
        <div>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Your answer</p>
          <p className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2">{answer.text_response}</p>
        </div>
      )}
      {q.type === 'image' && answer.image_response && (
        <div>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Your image</p>
          <img src={`http://localhost:8000${answer.image_response}`} alt="Your upload" className="max-h-32 rounded-lg border border-gray-200 object-contain" />
        </div>
      )}
      {(q.type === 'single' || q.type === 'multiple') && answer.selected_choices?.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Your answer</p>
          <ul className="space-y-1">
            {answer.selected_choices.map((c) => (
              <li key={c.id} className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2">{c.text}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Correct answer */}
      {answer.is_correct === false && (
        <div>
          <p className="text-xs text-green-600 font-medium uppercase tracking-wide mb-1">Correct answer</p>
          {q.correct_answer ? (
            <p className="text-sm text-gray-700 bg-green-50 rounded-lg px-3 py-2">{q.correct_answer}</p>
          ) : (
            <ul className="space-y-1">
              {answer.correct_choices?.map((c) => (
                <li key={c.id} className="text-sm text-gray-700 bg-green-50 rounded-lg px-3 py-2">{c.text}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* AI feedback */}
      {answer.ai_feedback && (
        <p className="text-xs text-gray-500 italic border-t border-gray-100 pt-2">{answer.ai_feedback}</p>
      )}
    </div>
  )
}

export default function Results() {
  const { id } = useParams()
  const [attempt, setAttempt] = useState(null)

  useEffect(() => {
    api.get(`/attempts/${id}/`).then((r) => setAttempt(r.data))
  }, [id])

  if (!attempt) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading results…</p>
      </div>
    )
  }

  const score = attempt.score ?? 0
  const total = attempt.questions.length

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Score card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <p className="text-gray-500 text-sm mb-1">Your Score</p>
          <p
            className="text-6xl font-bold text-indigo-600"
            aria-live="polite"
            aria-label={`Score: ${score} out of ${total}`}
          >
            {score} <span className="text-3xl text-gray-300">/ {total}</span>
          </p>
          <p className="mt-3 text-gray-500">
            {score === total ? '🎉 Perfect score!' :
             score >= total / 2 ? '👍 Good job!' : '📚 Keep practicing!'}
          </p>
        </div>

        {/* Per-question review */}
        <h2 className="text-lg font-semibold text-gray-800">Question Review</h2>
        {attempt.answers.map((ans) => (
          <AnswerReview key={ans.id} answer={ans} />
        ))}

        {/* Actions */}
        <div className="flex gap-3 flex-col sm:flex-row">
          <Link
            to="/"
            className="flex-1 text-center bg-indigo-600 text-white rounded-xl py-3 font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          >
            Start New Quiz
          </Link>
          <Link
            to="/history"
            className="flex-1 text-center border border-gray-300 text-gray-700 rounded-xl py-3 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
          >
            View History
          </Link>
        </div>
      </div>
    </div>
  )
}