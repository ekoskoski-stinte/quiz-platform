import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api/client'
import QuestionCard from '../components/QuestionCard'

export default function Quiz() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [attempt, setAttempt] = useState(null)
  const [responses, setResponses] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get(`/attempts/${id}/`).then((r) => setAttempt(r.data))
  }, [id])

  function setResponse(questionId, value) {
    setResponses((prev) => ({ ...prev, [questionId]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const formData = new FormData()

      const answers = attempt.questions.map((q) => {
        const res = responses[q.id]
        if (q.type === 'single') {
          return { question_id: q.id, selected_choice_ids: res ? [res] : [] }
        } else if (q.type === 'multiple') {
          return { question_id: q.id, selected_choice_ids: res || [] }
        } else {
          return { question_id: q.id, text_response: res || '' }
        }
      })

      formData.append('answers', JSON.stringify(answers))

      // Attach image files separately
      attempt.questions.forEach((q) => {
        if (q.type === 'image' && responses[q.id] instanceof File) {
          formData.append(`image_${q.id}`, responses[q.id])
        }
      })

      const { data } = await api.post(`/attempts/${id}/submit/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      navigate(`/results/${data.id}`)
    } catch (err) {
      setError(err.response?.data?.error || 'Submission failed. Please try again.')
      setSubmitting(false)
    }
  }

  if (!attempt) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading quiz…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-900">Quiz #{attempt.id}</h1>
          <span className="text-sm text-gray-500">{attempt.questions.length} questions</span>
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2 mb-4">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" aria-label="Quiz form">
          {attempt.questions.map((q, i) => (
            <QuestionCard
              key={q.id}
              question={q}
              index={i}
              response={responses[q.id]}
              onResponseChange={(val) => setResponse(q.id, val)}
            />
          ))}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-indigo-600 text-white rounded-xl py-3 font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 transition mt-4"
          >
            {submitting ? 'Submitting…' : 'Submit Quiz'}
          </button>
        </form>
      </div>
    </div>
  )
}