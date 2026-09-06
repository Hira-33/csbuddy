import { useChat } from '../../hooks/useChat'
import { ChatInput } from './ChatInput'
import { MessageList } from './MessageList'
import { TypingIndicator } from './TypingIndicator'

export function ChatContainer({ onSelectTerm }) {
  const { messages, isTyping, sendMessage, clearChat } = useChat()

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
      <div className="flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
            <svg className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-800">Chat</h2>
            <p className="text-xs text-slate-500">Ask about CS concepts</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            Clear
          </button>
        )}
      </div>
      <MessageList messages={messages} onSelectTerm={onSelectTerm} />
      {isTyping && <TypingIndicator />}
      <ChatInput onSend={sendMessage} disabled={isTyping} />
    </div>
  )
}
