import { useCallback, useEffect, useRef, useState } from 'react'
import { loadPyodide } from 'pyodide'

const PYODIDE_INDEX_URL = 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/'

export function usePyodide() {
  const pyodideRef = useRef(null)
  const [ready, setReady] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    loadPyodide({ indexURL: PYODIDE_INDEX_URL })
      .then((py) => {
        if (!cancelled) {
          pyodideRef.current = py
          setReady(true)
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const runCode = useCallback(async (code) => {
    const py = pyodideRef.current
    if (!py) {
      return { output: '', error: 'Pyodide is not ready yet.' }
    }

    let output = ''
    py.setStdout({ batched: (text) => { output += text + '\n' } })
    py.setStderr({ batched: (text) => { output += text + '\n' } })

    try {
      await py.runPythonAsync(code)
      return { output: output.trimEnd(), error: null }
    } catch (err) {
      return { output: output.trimEnd(), error: err.message }
    }
  }, [])

  return { ready, loading, error, runCode }
}
