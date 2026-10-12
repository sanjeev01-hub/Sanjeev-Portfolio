import type { ReactNode } from 'react'
import { site } from '../../config/site'
import { useLive } from '../../hooks/useLive'
import { getEnvironment, getGithub } from '../../lib/live'
import { LiveCtx } from './liveStore'

/** Fetches live data once for the whole page and refreshes it on an interval. */
export function LiveProvider({ children }: { children: ReactNode }) {
  const every = site.live.refreshMinutes * 60_000
  const env = useLive(getEnvironment, every)
  const github = useLive(getGithub, every)
  return <LiveCtx.Provider value={{ env, github }}>{children}</LiveCtx.Provider>
}
