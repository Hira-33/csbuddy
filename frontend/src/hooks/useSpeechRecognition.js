import { useEffect, useRef, useState } from 'react'

export function useSpeechRecognition({ onResult, lang = 'en-US' }) {
  const [supported, setSupported] = useState(false)
  const [listening, setListening] = useState(false)
  const [error, setError] = useState(null)
  const recognitionRef = useRef(null)

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      return
    }

    setSupported(true)
    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = lang

    recognition.onresult = (event) => {
      let transcript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript
      }
      onResult?.(transcript.trim())
    }

    recognition.onerror = (event) => {
      setError(event.error)
      setListening(false)
    }

    recognition.onend = () => {
      setListening(false)
    }

    recognitionRef.current = recognition

    return () => {
      try {
        recognition.stop()
      } catch {
        // already stopped
      }
    }
  }, [onResult, lang])

  const start = () => {
    setError(null)
    try {
      recognitionRef.current?.start()
      setListening(true)
    } catch {
      // already started
    }
  }

  const stop = () => {
    try {
      recognitionRef.current?.stop()
      setListening(false)
    } catch {
      // already stopped
    }
  }

  return { supported, listening, error, start, stop }
}
