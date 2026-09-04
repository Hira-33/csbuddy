import { useChat } from '../../hooks/useChat'
import { ChatInput } from './ChatInput'
import { MessageList } from './MessageList'
import { TypingIndicator } from './TypingIndicator'

export function ChatContainer({ onSelectTerm }) {
  const { messages, isTyping, sendMessage, clearChat } = useChat()

  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-slate-50 shadow-lg">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">CSBuddy</h2>
          <p className="text-xs text-slate-500">Ask about CS concepts</p>
        </div>
        <button
          onClick={clearChat}
          className="rounded-lg px-3 py-1 text-sm text-slate-600 hover:bg-slate-100"
        >
          Clear
        </button>
      </div>
      <MessageList messages={messages} onSelectTerm={onSelectTerm} />
      {isTyping && <TypingIndicator />}
      <ChatInput onSend={sendMessage} disabled={isTyping} />
    </div>
  )
}
