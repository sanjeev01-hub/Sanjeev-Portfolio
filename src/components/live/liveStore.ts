import { createContext, useContext } from 'react'
import type { useLive } from '../../hooks/useLive'
import type { EnvSnapshot, GithubSnapshot } from '../../lib/live'
import { homePlace, type Place } from '../../lib/visitor'

type LiveState<T> = ReturnType<typeof useLive<T>>

export interface LiveValue {
  env: LiveState<EnvSnapshot>
  github: LiveState<GithubSnapshot>
  /** Null while the visitor is being located. */
  place: Place | null
}

export const LiveCtx = createContext<LiveValue | null>(null)

export function useLiveData() {
  const v = useContext(LiveCtx)
  if (!v) throw new Error('useLiveData must be used inside <LiveProvider>')
  return v
}

/** The visitor's place, or the home city while locating. */
export function usePlace() {
  const { place } = useLiveData()
  return { place: place ?? homePlace, locating: place == null }
}
