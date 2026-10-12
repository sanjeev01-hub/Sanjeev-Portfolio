import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
} from 'motion/react'
import { useEffect, useState } from 'react'
import { useFinePointer } from '../hooks/useMedia'
import { ease, easeInOut } from '../lib/motion'

/* ───────────────────────────── Preloader ───────────────────────────── */

const SEEN_KEY = 'intro:seen'

function introAlreadySeen() {
  try {
    return sessionStorage.getItem(SEEN_KEY) === '1'
  } catch {
    return false
  }
}

/** A short counter + curtain on the first visit of a session. Calls onDone when the page should start animating. */
export function Preloader({ onDone }: { onDone: () => void }) {
  const [skip] = useState(() => introAlreadySeen() || window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [count, setCount] = useState(0)
  const [leaving, setLeaving] = useState(false)
  const [gone, setGone] = useState(skip)

  useEffect(() => {
    if (skip) {
      onDone()
      return
    }
    document.body.classList.add('is-locked')
    const start = performance.now()
    const total = 1250
    let raf = 0
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / total)
      // ease-out so the counter slows as it approaches 100
      setCount(Math.round((1 - Math.pow(1 - p, 3)) * 100))
      if (p < 1) raf = requestAnimationFrame(step)
      else {
        setLeaving(true)
        try {
          sessionStorage.setItem(SEEN_KEY, '1')
        } catch {
          /* ignore */
        }
      }
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Start the page's entrance while the curtain is still lifting.
  useEffect(() => {
    if (!leaving) return
    document.body.classList.remove('is-locked')
    const id = window.setTimeout(onDone, 250)
    return () => window.clearTimeout(id)
  }, [leaving, onDone])

  if (gone) return null

  return (
    <motion.div
      className="loader"
      aria-hidden
      initial={{ clipPath: 'inset(0 0 0% 0)' }}
      animate={leaving ? { clipPath: 'inset(0 0 100% 0)' } : undefined}
      transition={{ duration: 0.9, ease: easeInOut }}
      onAnimationComplete={() => leaving && setGone(true)}
    >
      <div className="loader__inner">
        <div className="loader__name">
          {'Sanjeev Sharma'.split('').map((c, i) => (
            <motion.span
              key={i}
              initial={{ y: '110%' }}
              animate={{ y: 0 }}
              transition={{ duration: 0.8, ease, delay: 0.1 + i * 0.03 }}
            >
              {c === ' ' ? ' ' : c}
            </motion.span>
          ))}
        </div>
        <div className="loader__bar">
          <motion.span style={{ scaleX: count / 100 }} />
        </div>
        <div className="loader__meta mono">
          <span>Software Developer</span>
          <span>{String(count).padStart(3, '0')}</span>
        </div>
      </div>
    </motion.div>
  )
}

/* ───────────────────────────── Scroll progress ───────────────────────────── */

export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 24, restDelta: 0.001 })
  return <motion.div className="scroll-progress" style={{ scaleX }} aria-hidden />
}

/* ───────────────────────────── Cursor ───────────────────────────── */

/**
 * Dot + trailing ring. Grows over interactive elements; elements with
 * data-cursor="label text" show that label inside the ring.
 */
export function Cursor() {
  const fine = useFinePointer()
  const reduce = useReducedMotion()
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const rx = useSpring(x, { stiffness: 180, damping: 20, mass: 0.5 })
  const ry = useSpring(y, { stiffness: 180, damping: 20, mass: 0.5 })
  const [mode, setMode] = useState<'idle' | 'hover' | 'label'>('idle')
  const [label, setLabel] = useState('')
  const [visible, setVisible] = useState(false)
  const [down, setDown] = useState(false)
  const enabled = fine && !reduce

  useEffect(() => {
    if (!enabled) return
    document.documentElement.classList.add('has-cursor')
    const sync = (target: Element | null) => {
      const el = target?.closest<HTMLElement>('[data-cursor], a, button, [role="tab"], label')
      if (el?.dataset.cursor) {
        setMode('label')
        setLabel(el.dataset.cursor)
      } else setMode(el ? 'hover' : 'idle')
    }
    const move = (e: PointerEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
      setVisible(true)
      sync(e.target as Element | null)
    }
    // content can move under a still pointer (scrolling, overlays opening) — re-check what's under it
    let raf = 0
    const recheck = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => sync(document.elementFromPoint(x.get(), y.get())))
    }
    const leave = () => setVisible(false)
    const pd = () => setDown(true)
    const pu = () => setDown(false)
    window.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('pointerleave', leave)
    window.addEventListener('pointerdown', pd)
    window.addEventListener('pointerup', pu)
    window.addEventListener('scroll', recheck, { passive: true, capture: true })
    let late = 0
    const onHash = () => {
      window.clearTimeout(late)
      late = window.setTimeout(recheck, 900) // after the overlay transition
    }
    window.addEventListener('hashchange', onHash)
    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(late)
      window.removeEventListener('hashchange', onHash)
      window.removeEventListener('scroll', recheck, { capture: true })
      document.documentElement.classList.remove('has-cursor')
      window.removeEventListener('pointermove', move)
      document.removeEventListener('pointerleave', leave)
      window.removeEventListener('pointerdown', pd)
      window.removeEventListener('pointerup', pu)
    }
  }, [enabled, x, y])

  if (!enabled) return null
  const size = mode === 'label' ? 88 : mode === 'hover' ? 52 : 34

  return (
    <>
      <motion.div className="cursor-dot" style={{ x, y, opacity: visible && mode !== 'label' ? 1 : 0 }} aria-hidden />
      <motion.div
        className={`cursor-ring cursor-ring--${mode}`}
        style={{ x: rx, y: ry, opacity: visible ? 1 : 0 }}
        animate={{ width: size, height: size, scale: down ? 0.85 : 1 }}
        transition={{ duration: 0.35, ease }}
        aria-hidden
      >
        <AnimatePresence>
          {mode === 'label' && (
            <motion.span
              key={label}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.25 }}
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  )
}

/* ───────────────────────────── Spotlight ───────────────────────────── */

/** Feeds the pointer position into any `.spot` card so its glow follows the cursor. */
export function Spotlight() {
  const fine = useFinePointer()
  useEffect(() => {
    if (!fine) return
    const move = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>('.spot')
      if (!el) return
      const r = el.getBoundingClientRect()
      el.style.setProperty('--mx', `${e.clientX - r.left}px`)
      el.style.setProperty('--my', `${e.clientY - r.top}px`)
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [fine])
  return null
}
