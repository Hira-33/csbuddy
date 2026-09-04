import mermaid from 'mermaid'
import { useEffect, useId, useState } from 'react'

export function DiagramViewer({ source }) {
  const reactId = useId()
  const id = reactId.replace(/[^a-zA-Z0-9]/g, '')
  const [svg, setSvg] = useState('')
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    mermaid.initialize({ startOnLoad: false, theme: 'default' })
    mermaid
      .render(`diagram-${id}`, source)
      .then(({ svg }) => {
        if (!cancelled) setSvg(svg)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
    return () => {
      cancelled = true
    }
  }, [source, id])

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
        Failed to render diagram: {error}
      </div>
    )
  }

  return (
    <div
      className="overflow-auto rounded-lg border border-slate-200 bg-white p-4"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
