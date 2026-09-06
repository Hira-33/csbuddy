import { useState } from 'react'
import { VoiceButton } from './VoiceButton'

export function ChatInput({ onSend, disabled }) {
  const [text, setText] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!text.trim() || disabled) return
    onSend(text.trim())
    setText('')
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 border-t border-slate-100 bg-white p-4"
    >
      <div className="flex flex-1 items-center rounded-full border border-slate-200 bg-slate-50 px-1 py-1 shadow-inner transition focus-within:border-indigo-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ask a CS question..."
          disabled={disabled}
          className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none disabled:cursor-not-allowed"
        />
        <VoiceButton onTranscript={setText} disabled={disabled} />
      </div>
      <button
        type="submit"
        disabled={disabled || !text.trim()}
        className="flex h-10 items-center gap-1.5 rounded-full bg-indigo-600 px-5 text-sm font-medium text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
      >
        <span>Send</span>
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      </button>
    </form>
  )
}
