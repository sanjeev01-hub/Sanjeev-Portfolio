import { AnimatePresence, MotionConfig } from 'motion/react'
import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { Cursor, Preloader, ScrollProgress, Spotlight } from './components/Chrome'
import { Hero } from './components/Hero'
import { LiveProvider } from './components/live/LiveContext'
import { Marquee } from './components/Marquee'
import { Nav } from './components/Nav'
import { projects } from './content/projects'

// Below-the-fold content and the case-study overlay load as separate chunks.
const BelowFold = lazy(() => import('./components/BelowFold'))
const Footer = lazy(() => import('./components/Contact').then((m) => ({ default: m.Footer })))
const CaseStudy = lazy(() => import('./components/CaseStudy').then((m) => ({ default: m.CaseStudy })))

const stack = ['React.js', 'React Native', 'Python', 'FastAPI', 'Flask', 'REST APIs', 'MySQL', 'InfluxDB', 'MQTT', 'Streamlit', 'Docker', 'Git']

/** Case studies live at #/work/<slug>, so they can be linked to and closed with the back button. */
function useCaseRoute() {
  const read = () => {
    const m = window.location.hash.match(/^#\/work\/([\w-]+)/)
    return m ? m[1] : null
  }
  const [slug, setSlug] = useState<string | null>(read)
  useEffect(() => {
    const on = () => setSlug(read())
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  const close = useCallback(() => {
    const opened = window.history.state?.caseOpened
    if (opened) window.history.back()
    else {
      // arrived directly on a case-study URL — land on the work section instead
      window.history.replaceState(null, '', '#work')
      setSlug(null)
      document.getElementById('work')?.scrollIntoView()
    }
  }, [])
  return { slug, close }
}

export default function App() {
  const [ready, setReady] = useState(false)
  const onReady = useCallback(() => setReady(true), [])
  const { slug, close } = useCaseRoute()
  const project = projects.find((p) => p.slug === slug) ?? null

  // Mark history entries we create for case studies so "close" can go back.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a[href^="#/work/"]')
      if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return
      e.preventDefault()
      const href = a.getAttribute('href')!
      const fromCase = window.history.state?.caseOpened
      if (fromCase) window.history.replaceState({ caseOpened: true }, '', href)
      else window.history.pushState({ caseOpened: true }, '', href)
      window.dispatchEvent(new HashChangeEvent('hashchange'))
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  return (
    <MotionConfig reducedMotion="user">
      <LiveProvider>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Preloader onDone={onReady} />
        <ScrollProgress />
        <Cursor />
        <Spotlight />
        <Nav ready={ready} />
        <main id="main">
          <Hero ready={ready} />
          <Marquee items={stack} />
          <Suspense fallback={<div className="below-fold-placeholder" />}>
            <BelowFold />
          </Suspense>
        </main>
        <Suspense fallback={null}>
          <Footer />
          <AnimatePresence>{project && <CaseStudy key="case" project={project} onClose={close} />}</AnimatePresence>
        </Suspense>
      </LiveProvider>
    </MotionConfig>
  )
}
