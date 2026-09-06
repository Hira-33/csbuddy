import { useEffect, useState } from 'react'
import { fetchGraph, fetchRelated, fetchTerm } from '../../services/api'
import { Tabs } from '../common/Tabs'
import { CodePlayground } from './CodePlayground'
import { ConceptGraph } from './ConceptGraph'
import { DiagramViewer } from './DiagramViewer'

function Badge({ children, color = 'blue' }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-700 ring-blue-500/10',
    green: 'bg-green-50 text-green-700 ring-green-500/10',
    purple: 'bg-purple-50 text-purple-700 ring-purple-500/10',
    orange: 'bg-orange-50 text-orange-700 ring-orange-500/10',
  }
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${colors[color] || colors.blue}`}
    >
      {children}
    </span>
  )
}

function Overview({ term, related, onSelectTerm }) {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <Badge color="purple">{term.difficulty}</Badge>
        {term.tags.map((tag) => (
          <Badge key={tag} color="blue">
            {tag}
          </Badge>
        ))}
      </div>
      <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
        <p className="leading-relaxed text-slate-700">{term.definition}</p>
      </div>
      {term.example && (
        <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-4">
          <h4 className="mb-1 text-sm font-semibold text-amber-800">Example</h4>
          <p className="text-sm leading-relaxed text-amber-900">{term.example}</p>
        </div>
      )}
      {related.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-semibold text-slate-800">Related concepts</h4>
          <div className="flex flex-wrap gap-2">
            {related.map((t) => (
              <button
                key={t.id}
                onClick={() => onSelectTerm?.(t.id)}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-700"
              >
                {t.term}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function TermPanel({ termId, onSelectTerm }) {
  const [term, setTerm] = useState(null)
  const [related, setRelated] = useState([])
  const [graphData, setGraphData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    setActiveTab('overview')

    Promise.all([fetchTerm(termId), fetchRelated(termId), fetchGraph(termId, 1)])
      .then(([termData, relatedData, graphData]) => {
        if (!cancelled) {
          setTerm(termData)
          setRelated(relatedData.related || [])
          setGraphData(graphData)
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
  }, [termId])

  if (loading) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />
        <p className="mt-3 text-sm text-slate-500">Loading term…</p>
      </div>
    )
  }

  if (error || !term) {
    return (
      <div className="flex h-full items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 text-red-600">
        <div className="text-center">
          <p className="font-medium">{error || 'Term not found'}</p>
          <button
            onClick={() => onSelectTerm?.(null)}
            className="mt-3 text-sm text-slate-500 underline hover:text-slate-700"
          >
            Close panel
          </button>
        </div>
      </div>
    )
  }

  const tabs = [{ id: 'overview', label: 'Overview' }, { id: 'graph', label: 'Graph' }]
  if (term.diagram_mermaid) {
    tabs.push({ id: 'diagram', label: 'Diagram' })
  }
  if (term.code_example) {
    tabs.push({ id: 'code', label: 'Code' })
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
      <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-800">{term.term}</h2>
            <p className="mt-0.5 text-sm text-slate-500">{term.short_summary}</p>
          </div>
          <button
            onClick={() => onSelectTerm?.(null)}
            className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            title="Close panel"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      <div className="flex-1 overflow-y-auto p-5">
        {activeTab === 'overview' && (
          <Overview term={term} related={related} onSelectTerm={onSelectTerm} />
        )}
        {activeTab === 'graph' && graphData && (
          <div className="h-[420px] overflow-hidden rounded-xl border border-slate-200 bg-slate-50/50">
            <ConceptGraph
              data={graphData}
              rootId={termId}
              onSelectTerm={onSelectTerm}
            />
          </div>
        )}
        {activeTab === 'diagram' && term.diagram_mermaid && (
          <DiagramViewer source={term.diagram_mermaid} />
        )}
        {activeTab === 'code' && term.code_example && (
          <CodePlayground
            initialCode={term.code_example.code}
            language={term.code_example.language}
          />
        )}
      </div>
    </div>
  )
}
