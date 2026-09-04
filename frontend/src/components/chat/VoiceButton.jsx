import { useCallback } from 'react'
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition'

export function VoiceButton({ onTranscript, disabled }) {
  const handleResult = useCallback(
    (text) => {
      onTranscript?.(text)
    },
    [onTranscript]
  )

  const { supported, listening, start, stop } = useSpeechRecognition({
    onResult: handleResult,
  })

  if (!supported) return null

  return (
    <button
      type="button"
      onClick={listening ? stop : start}
      disabled={disabled}
      title={listening ? 'Stop listening' : 'Voice input'}
      className={`rounded-full p-2 transition ${
        listening
          ? 'animate-pulse bg-red-100 text-red-600'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
      } disabled:opacity-50`}
    >
      {listening ? (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H9a1 1 0 100 2h2a1 1 0 100-2h-1v-2.07z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </button>
  )
}
