import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { About } from './About'
import { Approach } from './Approach'
import { Contact } from './Contact'
import { Experience } from './Experience'
import { Live } from './live/Live'
import { SECTIONS_EVENT } from './sections'
import { Skills } from './Skills'
import { Work } from './Work'

const sections = [Work, Live, About, Skills, Experience, Approach, Contact]

const hasIdle = typeof window.requestIdleCallback === 'function'
const idle = (cb: () => void) => (hasIdle ? window.requestIdleCallback(cb, { timeout: 300 }) : window.setTimeout(cb, 16))
const cancelIdle = (id: number) => (hasIdle ? window.cancelIdleCallback(id) : window.clearTimeout(id))
/** Without any interaction, render the rest anyway once the first screen has settled. */
const FALLBACK_MS = 5000

const deepLink = () => {
  const id = window.location.hash.slice(1)
  return id && !id.startsWith('/') ? id : null
}

/**
 * Everything after the hero. Loaded as its own chunk and kept out of the first
 * render so the opening screen becomes interactive quickly; it mounts as soon as
 * the visitor scrolls, taps or types (or after a short idle fallback), one section
 * per idle slot so no single long task blocks input.
 */
export default function BelowFold() {
  const [count, setCount] = useState(() => (deepLink() ? sections.length : 0))
  const [started, setStarted] = useState(() => deepLink() != null)

  // Start on the first sign of interaction. Pointer/key input may be a nav click,
  // so those mount everything synchronously before the click lands.
  useEffect(() => {
    if (started) return
    const soft = () => setStarted(true)
    const hard = () => {
      flushSync(() => {
        setStarted(true)
        setCount(sections.length)
      })
    }
    const opts = { passive: true, once: true } as const
    window.addEventListener('scroll', soft, opts)
    window.addEventListener('wheel', soft, opts)
    window.addEventListener('touchstart', soft, opts)
    window.addEventListener('pointerdown', hard, opts)
    window.addEventListener('keydown', hard, opts)
    window.addEventListener('hashchange', hard, opts)
    const timer = window.setTimeout(soft, FALLBACK_MS)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('scroll', soft)
      window.removeEventListener('wheel', soft)
      window.removeEventListener('touchstart', soft)
      window.removeEventListener('pointerdown', hard)
      window.removeEventListener('keydown', hard)
      window.removeEventListener('hashchange', hard)
    }
  }, [started])

  useEffect(() => {
    if (!started || count >= sections.length) return
    const id = idle(() => setCount((c) => c + 1))
    return () => cancelIdle(id)
  }, [started, count])

  useEffect(() => {
    if (count > 0) window.dispatchEvent(new Event(SECTIONS_EVENT))
  }, [count])

  // The browser tried to jump to a #section before this chunk existed — do it now.
  useEffect(() => {
    const id = deepLink()
    if (id) document.getElementById(id)?.scrollIntoView()
  }, [])

  return (
    <>
      {sections.slice(0, count).map((S, i) => (
        <S key={i} />
      ))}
      {count < sections.length && <div className="below-fold-placeholder" />}
    </>
  )
}
