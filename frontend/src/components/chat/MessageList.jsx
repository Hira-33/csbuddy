import { useEffect, useRef } from 'react'
import { MessageBubble } from './MessageBubble'

export function MessageList({ messages, onSelectTerm }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50">
          <svg className="h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="mb-1 text-lg font-semibold text-slate-800">What would you like to learn?</h3>
        <p className="max-w-sm text-sm text-slate-500">
          Ask about any computer science concept — algorithms, data structures, recursion, dynamic programming, and more.
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto space-y-5 p-5">
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          onSelectTerm={onSelectTerm}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
