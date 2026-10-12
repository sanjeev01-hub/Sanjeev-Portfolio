import { motion } from 'motion/react'
import { ArrowRight, ArrowUpRight, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { projects, type Project } from '../content/projects'
import { ease, easeInOut, fadeUp, inView, stagger } from '../lib/motion'
import { Mockup } from './mockups/Mockups'
import { Github } from './ui/BrandIcons'
import { SplitText } from './ui/Reveal'
import { caseHref } from '../lib/routes'

export function CaseStudy({ project: p, onClose }: { project: Project; onClose: () => void }) {
  const panel = useRef<HTMLDivElement>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)
  const idx = projects.findIndex((x) => x.slug === p.slug)
  const next = projects[(idx + 1) % projects.length]

  // lock page scroll, focus the dialog, restore focus on close
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    document.body.classList.add('is-locked')
    closeBtn.current?.focus({ preventScroll: true })
    return () => {
      document.body.classList.remove('is-locked')
      prev?.focus?.({ preventScroll: true })
    }
  }, [])

  // reset scroll when switching between case studies
  useEffect(() => {
    panel.current?.scrollTo({ top: 0 })
  }, [p.slug])

  // Esc to close + simple focus trap
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key !== 'Tab' || !panel.current) return
      const f = panel.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
      if (!f.length) return
      const first = f[0]
      const last = f[f.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const cs = p.caseStudy

  return (
    <motion.div
      className="case"
      role="dialog"
      aria-modal="true"
      aria-labelledby="case-title"
      initial={{ clipPath: 'inset(100% 0 0 0)' }}
      animate={{ clipPath: 'inset(0% 0 0 0)' }}
      exit={{ clipPath: 'inset(0 0 100% 0)' }}
      transition={{ duration: 0.85, ease: easeInOut }}
    >
      <div className="case__scroll" ref={panel}>
        <div className="case__bar container">
          <span className="mono muted">
            Case study {p.number} / {String(projects.length).padStart(2, '0')}
          </span>
          <button ref={closeBtn} className="case__close" onClick={onClose} aria-label="Close case study" data-cursor="Close">
            <X aria-hidden />
          </button>
        </div>

        <header className="case__hero container" key={p.slug}>
          <motion.p className="eyebrow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            {p.category}
          </motion.p>
          <SplitText as="h2" text={p.name} className="case__title" animateNow delay={0.45} />
          <motion.p
            className="case__summary"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.9, ease }}
          >
            {p.summary}
          </motion.p>
          <motion.dl
            className="case__facts"
            initial="hidden"
            animate="show"
            variants={stagger(0.06, 0.85)}
          >
            {[
              ['Role', p.role],
              ['Timeline', p.year],
              ['Stack', p.stack.join(', ')],
            ].map(([k, v]) => (
              <motion.div key={k} variants={fadeUp}>
                <dt className="eyebrow">{k}</dt>
                <dd>{v}</dd>
              </motion.div>
            ))}
          </motion.dl>
          {(p.links.github || p.links.live) && (
            <div className="case__links">
              {p.links.github && (
                <a href={p.links.github} target="_blank" rel="noreferrer" className="btn btn--ghost btn--sm">
                  <Github aria-hidden /> View source
                </a>
              )}
              {p.links.live && (
                <a href={p.links.live} target="_blank" rel="noreferrer" className="btn btn--primary btn--sm">
                  Live demo <ArrowUpRight aria-hidden />
                </a>
              )}
            </div>
          )}
        </header>

        <motion.div
          className="case__stage container"
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 1.1, ease }}
        >
          <div className="case__stage-inner">
            <Mockup kind={p.mockup} />
            <span className="project__caption mono">Illustrative interface</span>
          </div>
        </motion.div>

        <div className="case__body container">
          <CaseBlock n="01" title="The problem">
            <p className="case__lead">{cs.problem}</p>
          </CaseBlock>

          <CaseBlock n="02" title="Who it’s for">
            <List items={cs.users} />
          </CaseBlock>

          <CaseBlock n="03" title="My contribution">
            <List items={cs.contribution} />
          </CaseBlock>

          <CaseBlock n="04" title="Technical approach">
            <motion.div className="case__cards" initial="hidden" whileInView="show" viewport={inView} variants={stagger(0.1)}>
              {cs.approach.map((a, i) => (
                <motion.div key={a.title} className="case__card spot" variants={fadeUp}>
                  <span className="mono accent">0{i + 1}</span>
                  <h4>{a.title}</h4>
                  <p>{a.body}</p>
                </motion.div>
              ))}
            </motion.div>
          </CaseBlock>

          <CaseBlock n="05" title="Key decisions">
            <List items={cs.decisions} />
          </CaseBlock>

          <CaseBlock n="06" title="Challenges & trade-offs">
            <List items={cs.challenges} />
          </CaseBlock>

          <CaseBlock n="07" title="Outcome">
            <p className="case__lead">{cs.outcome}</p>
          </CaseBlock>
        </div>

        <a href={caseHref(next.slug)} className="case__next" data-cursor="Next">
          <span className="container">
            <span className="eyebrow">Next case study</span>
            <span className="case__next-title">
              {next.name} <ArrowRight aria-hidden />
            </span>
          </span>
        </a>
      </div>
    </motion.div>
  )
}

function CaseBlock({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <motion.section className="case__block" initial="hidden" whileInView="show" viewport={inView} variants={stagger(0.08)}>
      <motion.div className="case__block-head" variants={fadeUp}>
        <span className="mono accent">{n}</span>
        <h3>{title}</h3>
      </motion.div>
      <motion.div variants={fadeUp}>{children}</motion.div>
    </motion.section>
  )
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="case__list">
      {items.map((t) => (
        <li key={t}>{t}</li>
      ))}
    </ul>
  )
}
