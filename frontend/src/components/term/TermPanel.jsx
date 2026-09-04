import { useEffect, useState } from 'react'
import { fetchGraph, fetchRelated, fetchTerm } from '../../services/api'
import { Tabs } from '../common/Tabs'
import { CodePlayground } from './CodePlayground'
import { ConceptGraph } from './ConceptGraph'
import { DiagramViewer } from './DiagramViewer'

function Badge({ children, color = 'blue' }) {
  const colors = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    purple: 'bg-purple-100 text-purple-800',
  }
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${colors[color] || colors.blue}`}
    >
      {children}
    </span>
  )
}

function Overview({ term, related, onSelectTerm }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge color="purple">{term.difficulty}</Badge>
        {term.tags.map((tag) => (
          <Badge key={tag} color="blue">
            {tag}
          </Badge>
        ))}
      </div>
      <p className="text-slate-700 leading-relaxed">{term.definition}</p>
      {term.example && (
        <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
          <strong>Example:</strong> {term.example}
        </div>
      )}
      {related.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-semibold text-slate-800">Related</h4>
          <div className="flex flex-wrap gap-2">
            {related.map((t) => (
              <button
                key={t.id}
                onClick={() => onSelectTerm?.(t.id)}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700 hover:bg-slate-200"
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
      <div className="flex h-full items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-lg">
        <p className="text-sm text-slate-500">Loading term…</p>
      </div>
    )
  }

  if (error || !term) {
    return (
      <div className="flex h-full items-center justify-center rounded-2xl border border-slate-200 bg-white p-4 shadow-lg text-red-600">
        {error || 'Term not found'}
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
    <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white shadow-lg">
      <div className="border-b border-slate-200 p-4">
        <h2 className="text-lg font-bold text-slate-800">{term.term}</h2>
        <p className="text-sm text-slate-500">{term.short_summary}</p>
      </div>
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'overview' && (
          <Overview term={term} related={related} onSelectTerm={onSelectTerm} />
        )}
        {activeTab === 'graph' && graphData && (
          <div className="h-[400px] rounded-lg border border-slate-200 bg-slate-50">
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
