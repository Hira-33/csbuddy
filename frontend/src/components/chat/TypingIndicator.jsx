export function TypingIndicator() {
  return (
    <div className="flex justify-start px-4 pb-2">
      <div className="flex items-center gap-1 rounded-full bg-white px-4 py-2 text-slate-500 shadow-sm border border-slate-200">
        <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
      </div>
    </div>
  )
}
