import { useState } from 'react'
import { ChatContainer } from './components/chat/ChatContainer'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import { TermPanel } from './components/term/TermPanel'
import { useApiHealth } from './hooks/useApiHealth'

function App() {
  const [activeTermId, setActiveTermId] = useState(null)
  const { healthy, checking } = useApiHealth()

  return (
    <div className="flex h-screen flex-col bg-slate-100">
      <header className="flex items-center justify-between bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">CSBuddy</h1>
            <p className="text-xs text-indigo-100">Your CS concepts companion</p>
          </div>
        </div>
        {!checking && (
          <div
            className={`flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm ${
              healthy ? '' : 'bg-red-500/30'
            }`}
            title={healthy ? 'API is reachable' : 'API is unreachable'}
          >
            <span className={`h-2 w-2 rounded-full ${healthy ? 'bg-green-400' : 'bg-red-400'}`} />
            {healthy ? 'Online' : 'Offline'}
          </div>
        )}
      </header>
      <main className="relative flex flex-1 gap-4 overflow-hidden p-4">
        <div className={`min-w-0 flex-1 ${activeTermId ? 'hidden lg:block' : 'block'}`}>
          <ChatContainer onSelectTerm={setActiveTermId} />
        </div>
        {activeTermId && (
          <aside className="absolute inset-0 z-20 w-full p-4 lg:static lg:inset-auto lg:z-auto lg:block lg:w-[26rem] lg:p-0">
            <TermPanel termId={activeTermId} onSelectTerm={setActiveTermId} />
          </aside>
        )}
      </main>
    </div>
  )
}

export default function AppWithBoundary() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  )
}
