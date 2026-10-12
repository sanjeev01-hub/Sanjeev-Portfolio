import { useSyncExternalStore } from 'react'

export function useMedia(query: string, fallback = false) {
  return useSyncExternalStore(
    (onChange) => {
      const m = window.matchMedia(query)
      m.addEventListener('change', onChange)
      return () => m.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
    () => fallback,
  )
}

/** True on devices with a precise pointer that can hover (desktop). */
export const useFinePointer = () => useMedia('(hover: hover) and (pointer: fine)')
