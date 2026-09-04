import { useCallback, useRef, useState } from 'react'
import { streamAsk } from '../services/streamAsk'

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function useChat() {
  const [messages, setMessages] = useState([])
  const [isTyping, setIsTyping] = useState(false)
  const [activeTermId, setActiveTermId] = useState(null)
  const abortRef = useRef(null)

  const sendMessage = useCallback(async (query) => {
    if (!query.trim()) return

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    const userMessage = { id: makeId(), role: 'user', text: query }
    const assistantId = makeId()
    const assistantMessage = {
      id: assistantId,
      role: 'assistant',
      text: '',
      meta: null,
      diagram: null,
      code: null,
      related: [],
    }

    setMessages((prev) => [...prev, userMessage, assistantMessage])
    setIsTyping(true)

    await streamAsk({
      query,
      onEvent: (event, data) => {
        if (event === 'meta') {
          setActiveTermId(data.match?.term_id || null)
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, meta: data } : m
            )
          )
        } else if (event === 'token') {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, text: m.text + (data.text || '') } : m
            )
          )
        } else if (event === 'diagram') {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, diagram: data.mermaid } : m
            )
          )
        } else if (event === 'code') {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, code: data } : m
            )
          )
        } else if (event === 'related') {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, related: data.related || [] } : m
            )
          )
        } else if (event === 'done') {
          setIsTyping(false)
        }
      },
      onError: (err) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, text: `Error: ${err.message}` }
              : m
          )
        )
        setIsTyping(false)
      },
      abortSignal: controller.signal,
    })
  }, [])

  const clearChat = useCallback(() => {
    abortRef.current?.abort()
    setMessages([])
    setIsTyping(false)
    setActiveTermId(null)
  }, [])

  return { messages, isTyping, activeTermId, sendMessage, clearChat }
}
