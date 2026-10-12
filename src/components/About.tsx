import { motion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { site } from '../config/site'
import { ease, fadeUp, inView, stagger } from '../lib/motion'
import { Reveal, SplitText } from './ui/Reveal'

const focus = [
  { k: 'Now', v: 'Mobile apps with React Native and Python APIs at Micronix System' },
  { k: 'Focus', v: 'Web & mobile frontends, REST APIs, data-driven dashboards' },
  { k: 'Also', v: 'IoT pipelines — MQTT, InfluxDB, real-time visualisation' },
  { k: 'Education', v: 'MCA & BCA, Birla Institute of Technology, Mesra' },
  { k: 'Based in', v: site.location },
]

export function About() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const scale = useTransform(scrollYProgress, [0, 1], [1.18, 1])
  const y = useTransform(scrollYProgress, [0, 1], ['-6%', '6%'])

  return (
    <section id="about" className="section about" aria-labelledby="about-title">
      <div className="container about__grid">
        <div className="about__media" ref={ref}>
          <motion.div
            className="about__frame"
            initial={{ clipPath: 'inset(100% 0 0 0)' }}
            whileInView={{ clipPath: 'inset(0% 0 0 0)' }}
            viewport={inView}
            transition={{ duration: 1.4, ease }}
          >
            <motion.picture style={{ scale, y }}>
              <source srcSet="portrait.webp" type="image/webp" />
              <img src="portrait-fallback.jpg" alt="Portrait of Sanjeev Kumar Sharma" width={750} height={1000} loading="lazy" decoding="async" />
            </motion.picture>
          </motion.div>
          <span className="about__tag mono">
            <span className="accent">03</span> — About
          </span>
        </div>

        <div className="about__copy">
          <Reveal>
            <p className="eyebrow">About me</p>
          </Reveal>
          <SplitText as="h2" id="about-title" className="about__title" text="Good software is more than code." />
          <Reveal delay={0.1}>
            <p className="about__lead">
              I’m a software developer interested in building applications that solve practical problems. My work spans frontend interfaces,
              mobile development, backend APIs, databases, and data-driven tools.
            </p>
          </Reveal>
          <Reveal delay={0.18}>
            <p className="muted about__p">
              I enjoy understanding how a product is used, breaking down complicated requirements, and developing solutions that are clear,
              maintainable, and useful in real-world situations.
            </p>
          </Reveal>

          <motion.dl className="focus spot" initial="hidden" whileInView="show" viewport={inView} variants={stagger(0.07, 0.1)}>
            <motion.p className="focus__title eyebrow" variants={fadeUp}>
              Technical focus
            </motion.p>
            {focus.map((f) => (
              <motion.div key={f.k} className="focus__row" variants={fadeUp}>
                <dt className="mono">{f.k}</dt>
                <dd>{f.v}</dd>
              </motion.div>
            ))}
          </motion.dl>
        </div>
      </div>
    </section>
  )
}
