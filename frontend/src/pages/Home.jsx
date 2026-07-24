import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'

export default function Home() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function startQuiz() {
    const { data } = await api.post('/attempts/')
    navigate(`/quiz/${data.id}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-6 p-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Quiz Platform</h1>
        <div className="mt-2 flex items-center justify-center gap-2">
          <p className="text-gray-500">
            Playing as <strong>{user?.username}</strong>
          </p>
          {user?.is_guest && (
            <span className="text-xs bg-gray-100 text-gray-500 rounded-full px-2.5 py-0.5">
              guest
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={startQuiz}
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
        >
          Start New Quiz
        </button>
        <button
          onClick={() => navigate('/history')}
          className="border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
        >
          My History
        </button>
        {user?.is_admin && (
          <button
            onClick={() => navigate('/admin')}
            className="border border-indigo-300 text-indigo-700 px-6 py-3 rounded-xl font-medium hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
          >
            Admin Panel
          </button>
        )}
      </div>

      <button
        onClick={logout}
        className="text-sm text-gray-400 hover:text-gray-600 underline"
        aria-label="Reset session and start fresh as a new guest"
      >
        New session
      </button>
    </div>
  )
}