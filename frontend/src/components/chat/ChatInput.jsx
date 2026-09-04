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
      className="flex items-center gap-2 border-t border-slate-200 bg-white p-3"
    >
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Ask a CS question..."
        disabled={disabled}
        className="flex-1 rounded-full border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none disabled:bg-slate-100"
      />
      <VoiceButton onTranscript={setText} disabled={disabled} />
      <button
        type="submit"
        disabled={disabled || !text.trim()}
        className="rounded-full bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        Send
      </button>
    </form>
  )
}
