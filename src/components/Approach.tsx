import { motion } from 'motion/react'
import { principles } from '../content/profile'
import { ease, inView } from '../lib/motion'
import { SectionHeader } from './ui/Reveal'

export function Approach() {
  return (
    <section id="approach" className="section approach" aria-label="Development approach">
      <div className="container">
        <SectionHeader number="06" label="Development Approach" title="Three things I hold on to." />
        <ol className="principles">
          {principles.map((p, i) => (
            <motion.li
              key={p.title}
              className="principle"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={inView}
              transition={{ duration: 1, ease, delay: i * 0.08 }}
            >
              <span className="principle__num" aria-hidden>
                0{i + 1}
              </span>
              <h3 className="principle__title">{p.title}</h3>
              <p className="principle__body muted">{p.body}</p>
              <motion.span
                className="principle__rule"
                aria-hidden
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={inView}
                transition={{ duration: 1.4, ease, delay: 0.2 + i * 0.08 }}
              />
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  )
}
