import { motion } from 'motion/react'
import { skillGroups } from '../content/profile'
import { fadeUp, inView, stagger } from '../lib/motion'
import { SectionHeader } from './ui/Reveal'

export function Skills() {
  return (
    <section id="skills" className="section skills" aria-label="Technical expertise">
      <div className="container">
        <SectionHeader
          number="04"
          label="Technical Expertise"
          title="Tools I reach for, and where I’ve used them."
          lede="Grouped by the part of the product they serve. Hover a skill to see where it has shown up in my work."
        />
        <motion.div className="skills__grid" initial="hidden" whileInView="show" viewport={inView} variants={stagger(0.08)}>
          {skillGroups.map((g, gi) => (
            <motion.section key={g.id} className="sgroup spot" variants={fadeUp} aria-labelledby={`sg-${g.id}`}>
              <header className="sgroup__head">
                <span className="mono accent">{String(gi + 1).padStart(2, '0')}</span>
                <h3 id={`sg-${g.id}`}>{g.title}</h3>
                <p className="muted">{g.note}</p>
              </header>
              <ul className="sgroup__list">
                {g.items.map((s) => (
                  <li key={s.name} className="skill" tabIndex={s.usedIn ? 0 : undefined}>
                    <span className="skill__name">{s.name}</span>
                    {s.usedIn && <span className="skill__used mono">{s.usedIn}</span>}
                  </li>
                ))}
              </ul>
            </motion.section>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
