export function TypingIndicator() {
  return (
    <div className="flex justify-start px-5 pb-3">
      <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-slate-500 shadow-sm">
        <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400 [animation-delay:-0.3s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400 [animation-delay:-0.15s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400" />
        <span className="ml-1 text-xs font-medium">CSBuddy is thinking</span>
      </div>
    </div>
  )
}
