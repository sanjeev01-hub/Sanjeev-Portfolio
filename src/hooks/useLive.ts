import { useCallback, useEffect, useRef, useState } from 'react'

type Status = 'loading' | 'ready' | 'error'
type Loader<T> = (signal: AbortSignal, force: boolean) => Promise<{ data: T; fetchedAt: number }>

/**
 * Polls an async source while the tab is visible.
 * The last good value stays on screen during refreshes and after a failed refresh.
 */
export function useLive<T>(load: Loader<T>, intervalMs: number, enabled = true) {
  const [data, setData] = useState<T | null>(null)
  const [status, setStatus] = useState<Status>('loading')
  const [error, setError] = useState<string | null>(null)
  const [fetchedAt, setFetchedAt] = useState<number | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [attempt, setAttempt] = useState(0)

  const loadRef = useRef(load)
  useEffect(() => {
    loadRef.current = load
  }, [load])

  const run = useCallback(async (signal: AbortSignal, force = false) => {
    setRefreshing(true)
    try {
      const r = await loadRef.current(signal, force)
      if (signal.aborted) return
      setData(r.data)
      setFetchedAt(r.fetchedAt)
      setError(null)
      setStatus('ready')
    } catch (e) {
      if (signal.aborted) return
      setError((e as Error).message || 'Something went wrong.')
      setStatus((s) => (s === 'ready' ? 'ready' : 'error'))
    } finally {
      if (!signal.aborted) setRefreshing(false)
    }
  }, [])

  const retry = useCallback(() => {
    setStatus((s) => (s === 'error' ? 'loading' : s))
    setAttempt((n) => n + 1)
  }, [])

  useEffect(() => {
    if (!enabled) return
    const ctrl = new AbortController()
    // a manual retry (attempt > 0) bypasses the cache
    const first = window.setTimeout(() => run(ctrl.signal, attempt > 0), 0)
    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible') run(ctrl.signal, true)
    }, intervalMs)
    return () => {
      ctrl.abort()
      window.clearTimeout(first)
      window.clearInterval(id)
    }
  }, [enabled, intervalMs, run, attempt])

  return { data, status, error, fetchedAt, refreshing, retry }
}
