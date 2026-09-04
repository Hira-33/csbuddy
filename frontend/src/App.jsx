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
      <header className="flex items-center justify-between bg-white px-6 py-4 shadow-sm">
        <h1 className="text-xl font-bold text-slate-800">CSBuddy</h1>
        {!checking && (
          <div
            className={`flex items-center gap-1.5 text-xs font-medium ${
              healthy ? 'text-green-600' : 'text-red-600'
            }`}
            title={healthy ? 'API is reachable' : 'API is unreachable'}
          >
            <span className={`h-2 w-2 rounded-full ${healthy ? 'bg-green-500' : 'bg-red-500'}`} />
            {healthy ? 'Online' : 'Offline'}
          </div>
        )}
      </header>
      <main className="flex flex-1 gap-4 overflow-hidden p-4">
        <div className="min-w-0 flex-1">
          <ChatContainer onSelectTerm={setActiveTermId} />
        </div>
        {activeTermId && (
          <aside className="hidden w-96 lg:block">
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
