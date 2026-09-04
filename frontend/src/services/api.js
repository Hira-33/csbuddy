const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

export async function fetchTerms(params = {}) {
  const qs = new URLSearchParams(params).toString()
  const res = await fetch(`${API_BASE}/api/terms${qs ? `?${qs}` : ''}`)
  if (!res.ok) throw new Error('Failed to fetch terms')
  return res.json()
}

export async function fetchTerm(termId) {
  const res = await fetch(`${API_BASE}/api/terms/${termId}`)
  if (!res.ok) throw new Error('Term not found')
  return res.json()
}

export async function fetchRelated(termId, depth = 1) {
  const res = await fetch(`${API_BASE}/api/terms/related/${termId}?depth=${depth}`)
  if (!res.ok) throw new Error('Failed to fetch related terms')
  return res.json()
}

export async function fetchGraph(rootId, depth = 1) {
  const qs = new URLSearchParams({ depth: String(depth) })
  if (rootId) qs.set('root_id', rootId)
  const res = await fetch(`${API_BASE}/api/graph?${qs.toString()}`)
  if (!res.ok) throw new Error('Failed to fetch graph')
  return res.json()
}
