import { createContext, useContext } from 'react'
import type { useLive } from '../../hooks/useLive'
import type { EnvSnapshot, GithubSnapshot } from '../../lib/live'

type LiveState<T> = ReturnType<typeof useLive<T>>

export interface LiveValue {
  env: LiveState<EnvSnapshot>
  github: LiveState<GithubSnapshot>
}

export const LiveCtx = createContext<LiveValue | null>(null)

export function useLiveData() {
  const v = useContext(LiveCtx)
  if (!v) throw new Error('useLiveData must be used inside <LiveProvider>')
  return v
}
