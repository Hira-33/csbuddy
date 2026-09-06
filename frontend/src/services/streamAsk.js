function parseSseEvent(chunk) {
  const lines = chunk.split('\n')
  let event = 'message'
  const dataLines = []

  for (const line of lines) {
    if (line.startsWith('event:')) {
      event = line.slice(6).trim()
    } else if (line.startsWith('data:')) {
      dataLines.push(line.slice(5))
    }
  }

  const payload = dataLines.join('\n')
  try {
    return { event, data: JSON.parse(payload) }
  } catch {
    return { event, data: payload }
  }
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

export async function streamAsk({
  query,
  termId,
  includeSections,
  onEvent,
  onError,
  abortSignal,
}) {
  try {
    const response = await fetch(`${API_BASE}/api/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        term_id: termId,
        include_sections: includeSections,
      }),
      signal: abortSignal,
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`HTTP ${response.status}: ${text}`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const parts = buffer.split('\n\n')
      buffer = parts.pop() || ''
      for (const part of parts) {
        if (!part.trim()) continue
        const { event, data } = parseSseEvent(part)
        onEvent?.(event, data)
      }
    }

    if (buffer.trim()) {
      const { event, data } = parseSseEvent(buffer)
      onEvent?.(event, data)
    }
  } catch (err) {
    onError?.(err)
  }
}
