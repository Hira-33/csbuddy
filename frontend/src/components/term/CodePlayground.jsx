import Editor from '@monaco-editor/react'
import { useState } from 'react'
import { usePyodide } from '../../hooks/usePyodide'

export function CodePlayground({ initialCode, language }) {
  const [code, setCode] = useState(initialCode || '')
  const [output, setOutput] = useState('')
  const { ready, loading, error, runCode } = usePyodide()
  const isPython = language?.toLowerCase() === 'python'

  const handleRun = async () => {
    if (!isPython) {
      setOutput('Running code is supported for Python examples only.')
      return
    }
    setOutput('Running…')
    const result = await runCode(code)
    setOutput(result.error ? `Error: ${result.error}` : result.output || 'No output')
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-3 flex items-center justify-between">
        <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
          {language}
        </span>
        <button
          onClick={handleRun}
          disabled={!ready || loading}
          className="flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-1.5 text-sm font-medium text-white shadow-sm shadow-green-200 transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {loading ? 'Loading Python…' : 'Run'}
        </button>
      </div>
      <div className="min-h-[280px] flex-1 overflow-hidden rounded-xl border border-slate-200 shadow-sm">
        <Editor
          language={language || 'python'}
          value={code}
          onChange={(value) => setCode(value || '')}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            fontSize: 13,
            padding: { top: 12 },
          }}
        />
      </div>
      {error && (
        <div className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          Failed to load Python runtime: {error}
        </div>
      )}
      <div className="mt-3 min-h-[5rem] rounded-xl border border-slate-800 bg-slate-900 p-4 shadow-inner">
        <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Output</div>
        <pre className="whitespace-pre-wrap text-sm text-slate-50">{output || <span className="text-slate-500 italic">Click Run to see output</span>}</pre>
      </div>
    </div>
  )
}
