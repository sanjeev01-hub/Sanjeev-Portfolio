import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { site } from '../../config/site'
import { useLive } from '../../hooks/useLive'
import { getEnvironment, getGithub } from '../../lib/live'
import { homePlace, locateVisitor, type Place } from '../../lib/visitor'
import { LiveCtx } from './liveStore'

/** Locates the visitor, then fetches live data once for the whole page and refreshes it on an interval. */
export function LiveProvider({ children }: { children: ReactNode }) {
  const every = site.live.refreshMinutes * 60_000
  const [place, setPlace] = useState<Place | null>(null)

  useEffect(() => {
    const ctrl = new AbortController()
    locateVisitor(ctrl.signal).then((p) => !ctrl.signal.aborted && setPlace(p))
    return () => ctrl.abort()
  }, [])

  const loadEnv = useCallback((signal: AbortSignal, force: boolean) => getEnvironment(place ?? homePlace, signal, force), [place])
  const env = useLive(loadEnv, every, place != null)
  const github = useLive(getGithub, every)
  return <LiveCtx.Provider value={{ env, github, place }}>{children}</LiveCtx.Provider>
}
