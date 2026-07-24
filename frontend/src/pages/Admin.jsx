import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'

const TYPES = ['single', 'multiple', 'numerical', 'text', 'image']
const DIFFICULTIES = ['easy', 'medium', 'hard']

const EMPTY_FORM = {
  type: 'single',
  prompt: '',
  category: '',
  difficulty: 'medium',
  correct_answer: '',
  choices: [
    { text: '', is_correct: false },
    { text: '', is_correct: false },
  ],
}

export default function Admin() {
  const [questions, setQuestions] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadQuestions() }, [])

  async function loadQuestions() {
    const { data } = await api.get('/questions/')
    setQuestions(data)
  }

  function setField(key, val) {
    setForm((f) => ({ ...f, [key]: val }))
  }

  function setChoice(i, key, val) {
    const choices = [...form.choices]
    choices[i] = { ...choices[i], [key]: val }
    // For single choice, uncheck others when checking one
    if (key === 'is_correct' && val && form.type === 'single') {
      choices.forEach((c, idx) => { if (idx !== i) c.is_correct = false })
    }
    setForm((f) => ({ ...f, choices }))
  }

  function addChoice() {
    setForm((f) => ({ ...f, choices: [...f.choices, { text: '', is_correct: false }] }))
  }

  function removeChoice(i) {
    setForm((f) => ({ ...f, choices: f.choices.filter((_, idx) => idx !== i) }))
  }

  function startEdit(q) {
    setEditingId(q.id)
    setForm({
      type: q.type,
      prompt: q.prompt,
      category: q.category,
      difficulty: q.difficulty,
      correct_answer: q.correct_answer || '',
      choices: q.choices?.length
        ? q.choices.map((c) => ({ text: c.text, is_correct: c.is_correct }))
        : [{ text: '', is_correct: false }, { text: '', is_correct: false }],
    })
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setError('')
  }

  async function handleDelete(id) {
    if (!confirm('Delete this question?')) return
    await api.delete(`/questions/${id}/`)
    loadQuestions()
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)
    const payload = {
      ...form,
      choices: ['single', 'multiple'].includes(form.type) ? form.choices.filter((c) => c.text) : [],
    }
    try {
      if (editingId) {
        await api.put(`/questions/${editingId}/`, payload)
      } else {
        await api.post('/questions/', payload)
      }
      cancelEdit()
      loadQuestions()
    } catch (err) {
      const data = err.response?.data
      const msg = data ? Object.values(data).flat().join(' ') : 'Save failed.'
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  const needsChoices = ['single', 'multiple'].includes(form.type)
  const needsAnswer = ['text', 'numerical'].includes(form.type)

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Question Bank</h1>
          <Link to="/" className="text-sm text-indigo-600 hover:underline">← Home</Link>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">
            {editingId ? `Editing Question #${editingId}` : 'Add Question'}
          </h2>

          {error && (
            <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="q-type" className="block text-xs font-medium text-gray-700 mb-1">Type</label>
              <select id="q-type" value={form.type} onChange={(e) => setField('type', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {TYPES.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="q-cat" className="block text-xs font-medium text-gray-700 mb-1">Category</label>
              <input id="q-cat" type="text" required value={form.category} onChange={(e) => setField('category', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label htmlFor="q-diff" className="block text-xs font-medium text-gray-700 mb-1">Difficulty</label>
              <select id="q-diff" value={form.difficulty} onChange={(e) => setField('difficulty', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {DIFFICULTIES.map((d) => <option key={d} value={d} className="capitalize">{d}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="q-prompt" className="block text-xs font-medium text-gray-700 mb-1">Prompt</label>
            <textarea id="q-prompt" required rows={3} value={form.prompt} onChange={(e) => setField('prompt', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
          </div>

          {needsAnswer && (
            <div>
              <label htmlFor="q-answer" className="block text-xs font-medium text-gray-700 mb-1">
                Correct Answer {form.type === 'numerical' ? '(number)' : '(model answer)'}
              </label>
              <input id="q-answer" type={form.type === 'numerical' ? 'number' : 'text'} required
                value={form.correct_answer} onChange={(e) => setField('correct_answer', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          )}

          {needsChoices && (
            <div>
              <p className="text-xs font-medium text-gray-700 mb-2">
                Choices {form.type === 'single' ? '(check exactly one correct)' : '(check all correct)'}
              </p>
              <div className="space-y-2">
                {form.choices.map((c, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input type={form.type === 'single' ? 'radio' : 'checkbox'}
                      name="correct-choice" checked={c.is_correct}
                      onChange={(e) => setChoice(i, 'is_correct', e.target.checked || e.target.type === 'radio')}
                      aria-label={`Mark choice ${i + 1} as correct`}
                      className="text-indigo-600 focus:ring-indigo-500 shrink-0" />
                    <input type="text" value={c.text} placeholder={`Choice ${i + 1}`}
                      onChange={(e) => setChoice(i, 'text', e.target.value)}
                      aria-label={`Choice ${i + 1} text`}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    {form.choices.length > 2 && (
                      <button type="button" onClick={() => removeChoice(i)}
                        className="text-gray-400 hover:text-red-500 focus:outline-none" aria-label={`Remove choice ${i + 1}`}>✕</button>
                    )}
                  </div>
                ))}
              </div>
              <button type="button" onClick={addChoice}
                className="mt-2 text-sm text-indigo-600 hover:underline focus:outline-none">
                + Add choice
              </button>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 transition">
              {saving ? 'Saving…' : editingId ? 'Update' : 'Add Question'}
            </button>
            {editingId && (
              <button type="button" onClick={cancelEdit}
                className="border border-gray-300 text-gray-700 px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 transition">
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Question list */}
        <div className="space-y-2">
          <p className="text-sm text-gray-500 font-medium">{questions.length} questions in bank</p>
          {questions.map((q) => (
            <div key={q.id} className="bg-white rounded-xl border border-gray-200 px-5 py-4 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 font-medium truncate">{q.prompt}</p>
                <div className="flex gap-2 mt-1 flex-wrap">
                  <span className="text-xs bg-gray-100 text-gray-500 rounded-full px-2 py-0.5 capitalize">{q.type}</span>
                  <span className="text-xs bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">{q.category}</span>
                  <span className={`text-xs rounded-full px-2 py-0.5 capitalize ${
                    q.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                    q.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>{q.difficulty}</span>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => startEdit(q)}
                  aria-label={`Edit question: ${q.prompt}`}
                  className="text-xs border border-gray-200 text-gray-600 rounded-lg px-3 py-1.5 hover:border-indigo-400 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition">
                  Edit
                </button>
                <button onClick={() => handleDelete(q.id)}
                  aria-label={`Delete question: ${q.prompt}`}
                  className="text-xs border border-red-200 text-red-500 rounded-lg px-3 py-1.5 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400 transition">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}