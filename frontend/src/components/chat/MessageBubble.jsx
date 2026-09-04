import ReactMarkdown from 'react-markdown'

export function MessageBubble({ message, onSelectTerm }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-white text-slate-800 border border-slate-200'
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.text}</p>
        ) : (
          <>
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown>{message.text || 'Thinking...'}</ReactMarkdown>
            </div>
            {message.related?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {message.related.map((term) => (
                  <button
                    key={term.id}
                    onClick={() => onSelectTerm?.(term.id)}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200"
                  >
                    {term.term}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
