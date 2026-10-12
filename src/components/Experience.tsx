import { motion, useScroll, useSpring } from 'motion/react'
import { Award } from 'lucide-react'
import { useRef } from 'react'
import { certifications, education, experience, type TimelineEntry } from '../content/profile'
import { fadeUp, inView, stagger } from '../lib/motion'
import { Reveal, SectionHeader } from './ui/Reveal'

export function Experience() {
  const ref = useRef<HTMLOListElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 60%'] })
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 24 })

  return (
    <section id="experience" className="section experience" aria-label="Experience and education">
      <div className="container">
        <SectionHeader number="05" label="Experience & Education" title="Where the work has happened so far." />

        <div className="exp__grid">
          <div className="exp__col">
            <Reveal>
              <h3 className="eyebrow exp__label">Experience</h3>
            </Reveal>
            <ol className="timeline" ref={ref}>
              <span className="timeline__rail" aria-hidden>
                <motion.span style={{ scaleY: progress }} />
              </span>
              {experience.map((e) => (
                <Entry key={`${e.org}-${e.period}`} e={e} />
              ))}
            </ol>
          </div>

          <aside className="exp__col exp__side">
            <Reveal>
              <h3 className="eyebrow exp__label">Education</h3>
            </Reveal>
            <motion.ul className="edu" initial="hidden" whileInView="show" viewport={inView} variants={stagger(0.08)}>
              {education.map((e) => (
                <motion.li key={e.title} variants={fadeUp} className="edu__item">
                  <span className="mono muted">{e.period}</span>
                  <h4>{e.title}</h4>
                  <p className="muted">
                    {e.org} · <span className="mono">{e.place}</span>
                  </p>
                </motion.li>
              ))}
            </motion.ul>

            <Reveal>
              <h3 className="eyebrow exp__label exp__label--gap">Certifications</h3>
            </Reveal>
            <motion.ul className="certs" initial="hidden" whileInView="show" viewport={inView} variants={stagger(0.08)}>
              {certifications.map((c) => (
                <motion.li key={c} variants={fadeUp}>
                  <Award aria-hidden size={16} className="accent" />
                  {c}
                </motion.li>
              ))}
            </motion.ul>
          </aside>
        </div>
      </div>
    </section>
  )
}

function Entry({ e }: { e: TimelineEntry }) {
  return (
    <motion.li className="tl" initial="hidden" whileInView="show" viewport={inView} variants={stagger(0.06)}>
      <motion.span className={`tl__node ${e.current ? 'tl__node--now' : ''}`} variants={fadeUp} aria-hidden />
      <motion.div className="tl__head" variants={fadeUp}>
        <span className="mono muted">{e.period}</span>
        {e.current && <span className="chip chip--now">Current</span>}
        {e.kind === 'internship' && <span className="chip">Internship</span>}
      </motion.div>
      <motion.h4 className="tl__title" variants={fadeUp}>
        {e.title}
      </motion.h4>
      <motion.p className="tl__org" variants={fadeUp}>
        {e.org} <span className="muted">· {e.place}</span>
      </motion.p>
      <motion.ul className="tl__points" variants={fadeUp}>
        {e.points.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </motion.ul>
    </motion.li>
  )
}
