import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { nav, site } from '../config/site'
import { formatClock, useNow, zoneLabel } from '../hooks/useNow'
import { ease, easeInOut } from '../lib/motion'
import { useHideOnScroll } from '../hooks/useHideOnScroll'
import { usePlace } from './live/liveStore'
import { SECTIONS_EVENT } from './sections'
import { Logo } from './ui/Logo'

function useActiveSection(ids: readonly string[]) {
  const [active, setActive] = useState<string | null>(null)
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id)
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    // sections below the hero mount after first render — observe them as they appear
    const observe = () => ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) io.observe(el)
    })
    observe()
    window.addEventListener(SECTIONS_EVENT, observe)
    return () => {
      window.removeEventListener(SECTIONS_EVENT, observe)
      io.disconnect()
    }
  }, [ids])
  return active
}

const ids = nav.map((n) => n.id)

export function Nav({ ready }: { ready: boolean }) {
  const { hidden, scrolled } = useHideOnScroll()
  const active = useActiveSection(ids)
  const [open, setOpen] = useState(false)
  const now = useNow(1000)
  const { place } = usePlace()
  const time = formatClock(now, place.timezone)
  const zone = zoneLabel(place.timezone)

  useEffect(() => {
    document.body.classList.toggle('is-locked', open)
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <motion.header
        className={`nav ${scrolled ? 'nav--scrolled' : ''}`}
        initial={{ y: -80, opacity: 0 }}
        animate={ready ? { y: hidden && !open ? -90 : 0, opacity: 1 } : undefined}
        transition={{ duration: 0.7, ease }}
      >
        <div className="nav__inner container">
          <a href="#top" className="nav__mark" aria-label={`${site.shortName}, back to top`}>
            <Logo height={30} />
          </a>

          <nav className="nav__links" aria-label="Primary">
            <ul>
              {nav.map((n) => (
                <li key={n.id}>
                  <a href={`#${n.id}`} className={active === n.id ? 'is-active' : undefined} aria-current={active === n.id ? 'true' : undefined}>
                    {n.label}
                    {active === n.id && <motion.span className="nav__underline" layoutId="nav-underline" transition={{ duration: 0.5, ease }} />}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="nav__aside">
            <span className="nav__clock mono" title={`Local time in ${place.city} (${zone})`}>
              <span className="sr-only">Local time in {place.city}: </span>
              {time} <span className="muted">{zone}</span>
            </span>
            {site.availability.enabled && (
              <span className="nav__status">
                <span className="pulse-dot" aria-hidden />
                {site.availability.label}
              </span>
            )}
            <button
              className={`nav__burger ${open ? 'is-open' : ''}`}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={() => setOpen((o) => !o)}
            >
              <span />
              <span />
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="menu"
            initial={{ clipPath: 'circle(0% at calc(100% - 40px) 34px)' }}
            animate={{ clipPath: 'circle(150% at calc(100% - 40px) 34px)' }}
            exit={{ clipPath: 'circle(0% at calc(100% - 40px) 34px)' }}
            transition={{ duration: 0.75, ease: easeInOut }}
          >
            <nav className="menu__inner container" aria-label="Mobile">
              <ul>
                {nav.map((n, i) => (
                  <li key={n.id} className="mask">
                    <motion.a
                      href={`#${n.id}`}
                      onClick={() => setOpen(false)}
                      initial={{ y: '110%' }}
                      animate={{ y: 0 }}
                      transition={{ duration: 0.8, ease, delay: 0.25 + i * 0.06 }}
                    >
                      <span className="menu__num mono">0{i + 1}</span>
                      {n.label}
                    </motion.a>
                  </li>
                ))}
              </ul>
              <motion.div
                className="menu__foot"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>
                <span className="mono muted">{time} {zone}</span>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
