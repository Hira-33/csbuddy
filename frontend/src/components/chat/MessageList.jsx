import { useEffect, useRef } from 'react'
import { MessageBubble } from './MessageBubble'

export function MessageList({ messages, onSelectTerm }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex-1 overflow-y-auto space-y-4 p-4">
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
