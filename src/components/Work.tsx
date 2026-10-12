import { motion, useMotionValue, useScroll, useSpring, useTransform } from 'motion/react'
import { ArrowUpRight, Plus } from 'lucide-react'
import { Github } from './ui/BrandIcons'
import { useRef, type PointerEvent } from 'react'
import { otherWork, projects, type Project } from '../content/projects'
import { useFinePointer } from '../hooks/useMedia'
import { ease, fadeUp, inView, stagger } from '../lib/motion'
import { Mockup } from './mockups/Mockups'
import { Reveal, SectionHeader } from './ui/Reveal'
import { Magnetic } from './ui/Magnetic'
import { caseHref } from '../lib/routes'

export function Work() {
  return (
    <section id="work" className="section work" aria-label="Selected work">
      <div className="container">
        <SectionHeader
          number="01"
          label="Selected Work"
          title="Products shaped around real workflows."
          lede="Three areas of work that show how I approach a problem — from market operations on a phone to sensor data on a dashboard."
        />
        <div className="work__list">
          {projects.map((p, i) => (
            <ProjectCard key={p.slug} project={p} flip={i % 2 === 1} />
          ))}
        </div>
        <OtherWork />
      </div>
    </section>
  )
}

function ProjectCard({ project: p, flip }: { project: Project; flip: boolean }) {
  const ref = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLAnchorElement>(null)
  const fine = useFinePointer()

  // parallax: the mockup drifts against the scroll direction
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [36, -36])
  const numY = useTransform(scrollYProgress, [0, 1], [80, -80])

  // tilt on hover (desktop)
  const rx = useSpring(useMotionValue(0), { stiffness: 150, damping: 18 })
  const ry = useSpring(useMotionValue(0), { stiffness: 150, damping: 18 })
  const onMove = (e: PointerEvent) => {
    if (!fine || !stageRef.current) return
    const r = stageRef.current.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    ry.set(px * 8)
    rx.set(-py * 8)
  }
  const reset = () => {
    rx.set(0)
    ry.set(0)
  }

  return (
    <article ref={ref} className={`project ${flip ? 'project--flip' : ''}`} aria-labelledby={`p-${p.slug}`}>
      <motion.a
        ref={stageRef}
        href={caseHref(p.slug)}
        className="project__stage"
        data-cursor="Open"
        aria-label={`Open case study: ${p.name}`}
        onPointerMove={onMove}
        onPointerLeave={reset}
        initial={{ clipPath: 'inset(12% 12% 12% 12% round 22px)', opacity: 0 }}
        whileInView={{ clipPath: 'inset(0% 0% 0% 0% round 22px)', opacity: 1 }}
        viewport={inView}
        transition={{ duration: 1.3, ease }}
      >
        <motion.span className="project__bignum" style={{ y: numY }} aria-hidden>
          {p.number}
        </motion.span>
        <motion.div className="project__mock" style={{ y, rotateX: rx, rotateY: ry }}>
          <Mockup kind={p.mockup} />
        </motion.div>
        <span className="project__caption mono">Illustrative interface</span>
      </motion.a>

      <motion.div className="project__body" initial="hidden" whileInView="show" viewport={inView} variants={stagger(0.08, 0.15)}>
        <motion.div className="project__meta" variants={fadeUp}>
          <span className="mono accent">{p.number}</span>
          <span className="eyebrow">{p.category}</span>
        </motion.div>
        <motion.h3 id={`p-${p.slug}`} className="project__name" variants={fadeUp}>
          {p.name}
        </motion.h3>
        <motion.p className="project__summary" variants={fadeUp}>
          {p.summary}
        </motion.p>

        <motion.dl className="project__facts" variants={fadeUp}>
          <div>
            <dt className="eyebrow">Role</dt>
            <dd>{p.role}</dd>
          </div>
          <div>
            <dt className="eyebrow">Stack</dt>
            <dd className="project__stack">
              {p.stack.map((s) => (
                <span className="chip" key={s}>
                  {s}
                </span>
              ))}
            </dd>
          </div>
        </motion.dl>

        <motion.ul className="project__highlights" variants={fadeUp}>
          {p.highlights.map((h) => (
            <li key={h}>
              <Plus size={12} aria-hidden /> {h}
            </li>
          ))}
        </motion.ul>

        <motion.div className="project__actions" variants={fadeUp}>
          <Magnetic>
            <a href={caseHref(p.slug)} className="btn btn--ghost btn--sm">
              View Case Study <ArrowUpRight aria-hidden />
            </a>
          </Magnetic>
          {p.links.github && (
            <a href={p.links.github} className="link-arrow" target="_blank" rel="noreferrer">
              <Github aria-hidden /> Source
            </a>
          )}
          {p.links.live && (
            <a href={p.links.live} className="link-arrow" target="_blank" rel="noreferrer">
              Live demo <ArrowUpRight aria-hidden />
            </a>
          )}
        </motion.div>
      </motion.div>
    </article>
  )
}

function OtherWork() {
  return (
    <div className="other">
      <Reveal className="other__head">
        <h3 className="eyebrow">More work</h3>
      </Reveal>
      <motion.ul initial="hidden" whileInView="show" viewport={inView} variants={stagger(0.08)}>
        {otherWork.map((w) => (
          <motion.li key={w.name} className="other__row" variants={fadeUp}>
            <div className="other__title">
              <h4>{w.name}</h4>
              <span className="mono muted">{w.context}</span>
            </div>
            <p className="muted">{w.description}</p>
            <div className="other__tail">
              <span className="other__stack mono">{w.stack.join(' · ')}</span>
              <span className="other__links">
                {w.github && (
                  <a href={w.github} target="_blank" rel="noreferrer" className="link-arrow" aria-label={`${w.name} source code on GitHub`}>
                    <Github aria-hidden /> Code
                  </a>
                )}
                {w.live && (
                  <a href={w.live} target="_blank" rel="noreferrer" className="link-arrow" aria-label={`${w.name} live app`}>
                    Live <ArrowUpRight aria-hidden />
                  </a>
                )}
              </span>
            </div>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  )
}
