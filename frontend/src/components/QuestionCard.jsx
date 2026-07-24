import { useRef } from 'react'

function SingleChoice({ question, value, onChange }) {
  return (
    <fieldset>
      <legend className="sr-only">{question.prompt}</legend>
      <div className="space-y-2 mt-3">
        {question.choices.map((c) => (
          <label
            key={c.id}
            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
              value === c.id
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-200 hover:border-indigo-300'
            }`}
          >
            <input
              type="radio"
              name={`q-${question.id}`}
              value={c.id}
              checked={value === c.id}
              onChange={() => onChange(c.id)}
              className="text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-700">{c.text}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

function MultipleChoice({ question, value = [], onChange }) {
  function toggle(id) {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id])
  }
  return (
    <fieldset>
      <legend className="sr-only">{question.prompt} (select all that apply)</legend>
      <p className="text-xs text-gray-400 mt-1 mb-2">Select all that apply</p>
      <div className="space-y-2">
        {question.choices.map((c) => (
          <label
            key={c.id}
            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
              value.includes(c.id)
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-200 hover:border-indigo-300'
            }`}
          >
            <input
              type="checkbox"
              value={c.id}
              checked={value.includes(c.id)}
              onChange={() => toggle(c.id)}
              className="text-indigo-600 focus:ring-indigo-500 rounded"
            />
            <span className="text-sm text-gray-700">{c.text}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

function NumericalInput({ question, value, onChange }) {
  return (
    <div className="mt-3">
      <label htmlFor={`num-${question.id}`} className="sr-only">{question.prompt}</label>
      <input
        id={`num-${question.id}`}
        type="number"
        step="any"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter a number…"
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  )
}

function TextResponse({ question, value, onChange }) {
  return (
    <div className="mt-3">
      <label htmlFor={`text-${question.id}`} className="sr-only">{question.prompt}</label>
      <textarea
        id={`text-${question.id}`}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write your answer here…"
        rows={4}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
      />
    </div>
  )
}

function ImageUpload({ question, value, onChange }) {
  const inputRef = useRef()
  return (
    <div className="mt-3 space-y-2">
      <label
        htmlFor={`img-${question.id}`}
        className="block text-sm text-gray-600"
      >
        Upload an image:
      </label>
      <input
        ref={inputRef}
        id={`img-${question.id}`}
        type="file"
        accept="image/*"
        onChange={(e) => onChange(e.target.files[0] || null)}
        aria-label="Upload your answer image"
        className="block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 focus:outline-none"
      />
      {value && (
        <img
          src={URL.createObjectURL(value)}
          alt="Preview of your upload"
          className="mt-2 max-h-40 rounded-lg border border-gray-200 object-contain"
        />
      )}
    </div>
  )
}

export default function QuestionCard({ question, index, response, onResponseChange }) {
  const RENDERERS = {
    single: SingleChoice,
    multiple: MultipleChoice,
    numerical: NumericalInput,
    text: TextResponse,
    image: ImageUpload,
  }
  const Renderer = RENDERERS[question.type]

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-start gap-3">
        <span className="text-xs font-semibold bg-indigo-100 text-indigo-700 rounded-full px-2.5 py-1 shrink-0">
          Q{index + 1}
        </span>
        <div className="flex-1">
          <div className="flex gap-2 flex-wrap mb-3">
            <span className="text-xs bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">
              {question.category}
            </span>
            <span className={`text-xs rounded-full px-2 py-0.5 capitalize ${
              question.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
              question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {question.difficulty}
            </span>
          </div>
          <p className="text-gray-900 font-medium leading-snug">{question.prompt}</p>
          {Renderer && (
            <Renderer
              question={question}
              value={response}
              onChange={onResponseChange}
            />
          )}
        </div>
      </div>
    </div>
  )
}