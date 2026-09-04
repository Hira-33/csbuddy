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
      <div className="mb-2 flex items-center justify-between">
        <span className="rounded bg-slate-200 px-2 py-0.5 text-xs font-medium uppercase text-slate-700">
          {language}
        </span>
        <button
          onClick={handleRun}
          disabled={!ready || loading}
          className="rounded bg-green-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Loading Python…' : 'Run'}
        </button>
      </div>
      <div className="min-h-[300px] flex-1 overflow-hidden rounded-lg border border-slate-200">
        <Editor
          language={language || 'python'}
          value={code}
          onChange={(value) => setCode(value || '')}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />
      </div>
      {error && (
        <div className="mt-2 rounded bg-red-50 p-2 text-sm text-red-700">
          Failed to load Python runtime: {error}
        </div>
      )}
      <div className="mt-2 min-h-[4rem] rounded-lg bg-slate-900 p-3">
        <pre className="whitespace-pre-wrap text-sm text-slate-50">{output}</pre>
      </div>
    </div>
  )
}
