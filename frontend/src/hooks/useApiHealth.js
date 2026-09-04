import { useEffect, useState } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

export function useApiHealth(intervalMs = 30000) {
  const [healthy, setHealthy] = useState(true)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    let cancelled = false

    const check = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/admin/health`, {
          cache: 'no-store',
        })
        const data = await res.json()
        if (!cancelled) {
          setHealthy(res.ok && data.status === 'ok')
        }
      } catch {
        if (!cancelled) setHealthy(false)
      } finally {
        if (!cancelled) setChecking(false)
      }
    }

    check()
    const id = setInterval(check, intervalMs)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [intervalMs])

  return { healthy, checking }
}
