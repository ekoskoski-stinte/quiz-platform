import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'

export default function History() {
  const [attempts, setAttempts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/attempts/')
      .then((r) => setAttempts(r.data))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-900">My History</h1>
          <Link to="/" className="text-sm text-indigo-600 hover:underline">← Home</Link>
        </div>

        {loading && <p className="text-gray-500 text-center py-12">Loading…</p>}

        {!loading && attempts.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg">No attempts yet.</p>
            <Link to="/" className="mt-4 inline-block text-indigo-600 hover:underline font-medium">
              Start your first quiz →
            </Link>
          </div>
        )}

        <ul className="space-y-3" aria-label="Past quiz attempts">
          {attempts.map((a) => (
            <li key={a.id}>
              <Link
                to={`/results/${a.id}`}
                className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-5 py-4 hover:border-indigo-300 hover:shadow-sm transition group"
                aria-label={`Attempt ${a.id}, score ${a.score ?? 'unsubmitted'}`}
              >
                <div>
                  <p className="font-medium text-gray-900 group-hover:text-indigo-700">
                    Attempt #{a.id}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(a.started_at).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="text-right">
                  {a.submitted_at ? (
                    <span className="text-lg font-bold text-indigo-600">
                      {a.score} / 5
                    </span>
                  ) : (
                    <span className="text-xs bg-yellow-100 text-yellow-700 rounded-full px-2.5 py-1">
                      In progress
                    </span>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}