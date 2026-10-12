import { motion, useScroll, useTransform } from 'motion/react'
import { ArrowDownRight, ArrowRight, GitCommitHorizontal, Wind } from 'lucide-react'
import { useRef } from 'react'
import { site } from '../config/site'
import { formatIST, useNow } from '../hooks/useNow'
import { aqiLevel, describeWeather, timeAgo } from '../lib/live'
import { ease, maskUp, stagger } from '../lib/motion'
import { useLiveData } from './live/liveStore'
import { Magnetic } from './ui/Magnetic'
import { SignalField } from './SignalField'

const headline: { text: string; accent?: boolean }[][] = [
  [{ text: 'I' }, { text: 'build' }, { text: 'digital' }],
  [{ text: 'experiences' }, { text: 'that' }, { text: 'work' }],
  [{ text: 'beyond', accent: true }, { text: 'the', accent: true }, { text: 'interface.', accent: true }],
]

export function Hero({ ready }: { ready: boolean }) {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  // content and footer move as one block so they can never overlap
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '14%'])
  const fade = useTransform(scrollYProgress, [0.12, 0.75], [1, 0])
  const state = ready ? 'show' : 'hidden'

  return (
    <section ref={ref} className="hero" id="top" aria-labelledby="hero-title">
      <SignalField />
      <div className="hero__glow" aria-hidden />

      <motion.div className="hero__content" style={{ y, opacity: fade }}>
      <div className="hero__inner container">
        <motion.p
          className="eyebrow hero__eyebrow"
          initial={{ opacity: 0, y: 12 }}
          animate={ready ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.8, ease, delay: 0.1 }}
        >
          <span className="pulse-dot pulse-dot--accent" aria-hidden />
          Software Developer · India
        </motion.p>

        <h1 id="hero-title" className="hero__title" aria-label="I build digital experiences that work beyond the interface.">
          <motion.span aria-hidden initial="hidden" animate={state} variants={stagger(0.07, 0.2)} style={{ display: 'block' }}>
            {headline.map((line, li) => (
              <span className="hero__line" key={li}>
                {line.map((w, wi) => (
                  <span className="word" key={wi}>
                    <motion.span variants={maskUp} className={w.accent ? 'hero__accent' : undefined}>
                      {w.text}
                    </motion.span>
                    {wi < line.length - 1 ? ' ' : null}
                  </span>
                ))}
              </span>
            ))}
          </motion.span>
        </h1>

        <motion.div
          className="hero__grid"
          initial="hidden"
          animate={state}
          variants={stagger(0.1, 0.85)}
        >
          <motion.p className="hero__lede" variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.9, ease } } }}>
            I’m a software developer focused on building thoughtful web and mobile applications, connecting reliable backends, and turning
            complex workflows into usable products.
          </motion.p>

          <motion.div className="hero__ctas" variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.9, ease } } }}>
            <Magnetic>
              <a href="#work" className="btn btn--primary">
                Explore My Work <ArrowRight aria-hidden />
              </a>
            </Magnetic>
            <Magnetic>
              <a href="#contact" className="btn btn--ghost">
                Let’s Talk
              </a>
            </Magnetic>
          </motion.div>

          <motion.div variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 1, ease } } }}>
            <HeroTelemetry />
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        className="hero__foot container"
        initial={{ opacity: 0 }}
        animate={ready ? { opacity: 1 } : undefined}
        transition={{ delay: 1.5, duration: 1 }}
      >
        <a href="#work" className="hero__scroll" aria-label="Scroll to selected work">
          <span className="hero__scroll-track" aria-hidden>
            <span />
          </span>
          <span className="mono">Scroll</span>
        </a>
        <p className="hero__sig mono" aria-label="Technical signature">
          <span>22.80°N 86.20°E</span>
          <span className="hero__sig-sep" aria-hidden>/</span>
          <span>React · React Native · Python</span>
          <span className="hero__sig-sep" aria-hidden>/</span>
          <span>MCA, BIT Mesra</span>
        </p>
      </motion.div>
      </motion.div>
    </section>
  )
}

/** Compact live readout: local time, weather, air quality and last GitHub push. */
function HeroTelemetry() {
  const { env, github } = useLiveData()
  const now = useNow(1000)
  const lastPush = github.data?.repos[0]?.pushed_at
  const aqi = env.data?.air.aqi
  const lvl = aqi != null ? aqiLevel(aqi) : null
  const temps = env.data?.series.temperature.filter((v): v is number => v != null) ?? []

  return (
    <a href="#live" className="tele spot" data-cursor="Live">
      <div className="tele__head">
        <span className="tele__label mono">
          <span className="pulse-dot" aria-hidden /> Live · {site.live.place}
        </span>
        <span className="mono tele__time">{formatIST(now)} IST</span>
      </div>

      <div className="tele__main">
        <div>
          <span className="tele__k">Temperature</span>
          <div className="tele__temp mono">
            {env.data ? (
              <>
                {env.data.current.temperature.toFixed(1)}
                <small>°C</small>
              </>
            ) : env.status === 'error' ? (
              <small>Unavailable</small>
            ) : (
              <span className="skeleton" style={{ width: 92, height: 30 }} />
            )}
          </div>
          {env.data && <span className="tele__desc">{describeWeather(env.data.current.code)}</span>}
        </div>
        {temps.length > 2 && <Sparkline values={temps} />}
      </div>

      <dl className="tele__cells">
        <div>
          <dt className="tele__k">
            <Wind aria-hidden size={12} /> Air quality
          </dt>
          <dd className="mono">
            {aqi != null && lvl ? (
              <>
                <span className={`tone-dot tone-dot--${lvl.tone}`} aria-hidden />
                {aqi}
                <span className="tele__sub">{lvl.label.split(' ')[0]}</span>
              </>
            ) : env.status === 'loading' ? (
              <span className="skeleton" style={{ width: 54, height: 14 }} />
            ) : (
              '—'
            )}
          </dd>
        </div>
        <div>
          <dt className="tele__k">
            <GitCommitHorizontal aria-hidden size={12} /> Last push
          </dt>
          <dd className="mono">
            {lastPush ? timeAgo(lastPush, now) : github.status === 'error' ? 'Unavailable' : <span className="skeleton" style={{ width: 64, height: 14 }} />}
          </dd>
        </div>
      </dl>

      <span className="tele__more">
        <span>Open live dashboard</span>
        <ArrowDownRight aria-hidden size={14} />
      </span>
    </a>
  )
}

/** Tiny 24-hour trend line. */
function Sparkline({ values }: { values: number[] }) {
  const W = 120
  const H = 44
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const pts = values.map((v, i) => [(i / (values.length - 1)) * W, H - 4 - ((v - min) / span) * (H - 8)] as const)
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const [lx, ly] = pts[pts.length - 1]
  return (
    <svg className="tele__spark" viewBox={`0 0 ${W} ${H}`} width={W} height={H} aria-hidden>
      <defs>
        <linearGradient id="spark-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--c-temp)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="var(--c-temp)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${d} L${W},${H} L0,${H} Z`} fill="url(#spark-fill)" />
      <motion.path d={d} fill="none" stroke="var(--c-temp)" strokeWidth="1.6" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.6, ease }} />
      <circle cx={lx} cy={ly} r="2.5" fill="var(--text)" />
      <text x="0" y="10" className="tele__spark-l">24h</text>
    </svg>
  )
}
