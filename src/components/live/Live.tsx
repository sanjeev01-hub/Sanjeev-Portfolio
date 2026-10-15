import { AnimatePresence, motion } from 'motion/react'
import { ArrowUpRight, CircleAlert, Cloud, Droplets, FolderGit2, GitCommitHorizontal, Gauge, MapPin, RotateCw, Thermometer, Wind } from 'lucide-react'
import { useState } from 'react'
import { site } from '../../config/site'
import { useNow, zoneLabel } from '../../hooks/useNow'
import { aqiLevel, describeWeather, timeAgo, type EnvSnapshot, type GhEvent, type GithubSnapshot } from '../../lib/live'
import { ease, fadeUp, inView, stagger } from '../../lib/motion'
import { Github } from '../ui/BrandIcons'
import { CountUp, SectionHeader } from '../ui/Reveal'
import { LiveChart, type Band } from './LiveChart'
import { formatCoords } from '../../lib/visitor'
import { useLiveData, usePlace } from './liveStore'

export function Live() {
  const { place, locating } = usePlace()
  return (
    <section id="live" className="section live" aria-label="Live data">
      <div className="container">
        <SectionHeader
          number="02"
          label="Live Lab"
          title="Real data, updating while you read."
          lede={
            <>
              The same pattern I use in IoT dashboards — poll a source, normalise it, visualise it — running on public data. Environmental readings for{' '}
              {locating ? 'your location' : place.detected ? `${place.city} — where you are right now —` : place.city} come from Open-Meteo; activity comes from my public GitHub.
            </>
          }
        />
        <Pipeline />
        <div className="live__grid">
          <EnvironmentPanel />
          <GithubPanel />
        </div>
      </div>
    </section>
  )
}

/* ───────────────────────────── pipeline strip ───────────────────────────── */

function Pipeline() {
  const steps = ['Public API', `Poll · ${site.live.refreshMinutes} min`, 'Normalise', 'Render']
  return (
    <motion.ol className="pipe" initial="hidden" whileInView="show" viewport={inView} variants={stagger(0.12)} aria-label="How this section works">
      {steps.map((s, i) => (
        <motion.li key={s} variants={fadeUp} className="pipe__step spot">
          <span className="mono accent">0{i + 1}</span>
          <span>{s}</span>
          {i < steps.length - 1 && (
            <span className="pipe__wire" aria-hidden>
              <i />
            </span>
          )}
        </motion.li>
      ))}
    </motion.ol>
  )
}

/* ───────────────────────────── status bar ───────────────────────────── */

function PanelStatus({
  fetchedAt,
  refreshing,
  error,
  onRetry,
  source,
}: {
  fetchedAt: number | null
  refreshing: boolean
  error: string | null
  onRetry: () => void
  source: string
}) {
  const now = useNow(5000)
  return (
    <div className="pstatus mono">
      <span className="pstatus__live">
        <span className={`pulse-dot ${error ? 'pulse-dot--off' : ''}`} aria-hidden />
        {error && fetchedAt ? 'Showing last reading' : 'Live'}
      </span>
      <span className="muted" aria-live="polite">
        {fetchedAt ? `Updated ${timeAgo(fetchedAt, now)}` : 'Connecting…'}
      </span>
      <span className="muted pstatus__src">Source: {source}</span>
      <button className="pstatus__btn" onClick={onRetry} aria-label="Refresh data" disabled={refreshing}>
        <RotateCw size={13} aria-hidden className={refreshing ? 'spin' : undefined} />
      </button>
    </div>
  )
}

function PanelError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="perror" role="alert">
      <CircleAlert aria-hidden size={18} />
      <div>
        <p>Couldn’t load live data.</p>
        <p className="muted">{message}</p>
      </div>
      <button className="btn btn--ghost btn--sm" onClick={onRetry}>
        Try again
      </button>
    </div>
  )
}

/* ───────────────────────────── environment ───────────────────────────── */

type Metric = 'temperature' | 'humidity' | 'pm25' | 'co2'
const metrics: { id: Metric; label: string; unit: string; decimals: number; color: string }[] = [
  { id: 'temperature', label: 'Temperature', unit: '°C', decimals: 1, color: 'var(--c-temp)' },
  { id: 'humidity', label: 'Humidity', unit: '%', decimals: 0, color: 'var(--c-hum)' },
  { id: 'pm25', label: 'PM2.5', unit: ' µg/m³', decimals: 1, color: 'var(--c-pm)' },
  { id: 'co2', label: 'CO₂', unit: ' ppm', decimals: 0, color: 'var(--c-co2)' },
]

/** US EPA PM2.5 (24-hour) AQI breakpoints, 2024 revision. */
const pm25Bands: Band[] = [
  { from: 0, to: 9, tone: 'good', label: 'Good' },
  { from: 9, to: 35.4, tone: 'moderate', label: 'Moderate' },
  { from: 35.4, to: 55.4, tone: 'warning', label: 'Sensitive groups' },
  { from: 55.4, to: 125.4, tone: 'serious', label: 'Unhealthy' },
  { from: 125.4, to: 500, tone: 'critical', label: 'Very unhealthy' },
]

const clamp01 = (v: number) => Math.max(0, Math.min(1, v))
const nums = (arr: (number | null)[]) => arr.filter((v): v is number => v != null)

function EnvironmentPanel() {
  const { env } = useLiveData()
  const { place, locating } = usePlace()
  const { data, status, error, fetchedAt, refreshing, retry } = env

  return (
    <motion.article
      className="panel panel--env spot"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={inView}
      transition={{ duration: 1, ease }}
      aria-labelledby="env-title"
    >
      <header className="panel__head">
        <div>
          <h3 id="env-title" className="panel__title">
            <MapPin aria-hidden size={16} /> {locating ? 'Locating you…' : [place.city, place.country].filter((s, i, a) => s && a.indexOf(s) === i).join(', ')}
          </h3>
          <p className="mono muted panel__sub">
            {formatCoords(place)} · {place.detected ? 'your location' : 'environment monitor'}
          </p>
        </div>
        <PanelStatus fetchedAt={fetchedAt} refreshing={refreshing} error={error} onRetry={retry} source="Open-Meteo" />
      </header>

      {status === 'error' && !data ? (
        <PanelError message={error ?? ''} onRetry={retry} />
      ) : !data ? (
        <EnvSkeleton />
      ) : (
        <EnvBody data={data} zone={zoneLabel(place.timezone)} />
      )}
    </motion.article>
  )
}

function EnvSkeleton() {
  return (
    <div className="env" aria-busy="true" aria-label="Loading environmental data">
      <div className="env__top">
        <span className="skeleton" style={{ height: 120 }} />
        <span className="skeleton" style={{ height: 120 }} />
      </div>
      <span className="skeleton" style={{ height: 240, marginTop: 24 }} />
    </div>
  )
}

function EnvBody({ data, zone }: { data: EnvSnapshot; zone: string }) {
  const [metric, setMetric] = useState<Metric>('temperature')
  const m = metrics.find((x) => x.id === metric)!
  const c = data.current
  const a = data.air
  const available = metrics.filter((x) => data.series[x.id].some((v) => v != null))
  const temps = nums(data.series.temperature)
  const tMin = temps.length ? Math.min(...temps) : c.temperature
  const tMax = temps.length ? Math.max(...temps) : c.temperature
  const tPos = tMax > tMin ? clamp01((c.temperature - tMin) / (tMax - tMin)) : 0.5
  const status = (sub: number | null) => (sub == null ? undefined : { ...aqiLevel(sub), meter: clamp01(sub / 300) })

  return (
    <div className="env">
      <div className="env__top">
        <div className="env__hero">
          <span className="eyebrow">
            <span className="chip-icon" style={{ '--chip': 'var(--c-temp)' } as React.CSSProperties}>
              <Thermometer aria-hidden size={12} />
            </span>
            Now · {describeWeather(c.code)}
          </span>
          <div className="env__temp">
            <CountUp value={c.temperature} decimals={1} />
            <span className="env__unit">°C</span>
          </div>
          <p className="muted mono">Feels like {c.apparent.toFixed(1)}°C</p>
          <div className="trange" aria-label={`24-hour range ${tMin.toFixed(1)} to ${tMax.toFixed(1)} degrees`}>
            <div className="trange__bar">
              <motion.span
                className="trange__fill"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease }}
              />
              <motion.span
                className="trange__now"
                initial={{ left: '0%', opacity: 0 }}
                whileInView={{ left: `${tPos * 100}%`, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.4, ease, delay: 0.3 }}
              />
            </div>
            <div className="trange__labels mono">
              <span>{tMin.toFixed(1)}°</span>
              <span>24h range</span>
              <span>{tMax.toFixed(1)}°</span>
            </div>
          </div>
        </div>

        <motion.dl className="env__stats" initial="hidden" whileInView="show" viewport={inView} variants={stagger(0.06)}>
          <Stat icon={<Droplets size={12} />} color="var(--c-hum)" label="Humidity" value={c.humidity} unit="%" meter={c.humidity / 100} />
          <Stat icon={<Wind size={12} />} label="Wind" value={c.wind} unit=" km/h" decimals={1} meter={clamp01(c.wind / 50)} />
          <Stat icon={<Gauge size={12} />} label="Pressure" value={c.pressure} unit=" hPa" meter={clamp01((c.pressure - 960) / 80)} />
          <Stat icon={<Cloud size={12} />} label="Cloud cover" value={c.cloud} unit="%" meter={c.cloud / 100} />
        </motion.dl>

        {a.aqi != null && <AqiGauge aqi={a.aqi} />}
      </div>

      <motion.dl className="env__air" initial="hidden" whileInView="show" viewport={inView} variants={stagger(0.06)}>
        <Stat label="PM2.5" color="var(--c-pm)" value={a.pm25} unit=" µg/m³" decimals={1} status={status(a.aqiBy.pm25)} />
        <Stat label="PM10" value={a.pm10} unit=" µg/m³" decimals={1} status={status(a.aqiBy.pm10)} />
        <Stat label="CO" value={a.co} unit=" µg/m³" status={status(a.aqiBy.co)} />
        <Stat label="NO₂" value={a.no2} unit=" µg/m³" decimals={1} status={status(a.aqiBy.no2)} />
        <Stat label="CO₂" color="var(--c-co2)" value={a.co2} unit=" ppm" spark={nums(data.series.co2)} />
      </motion.dl>

      <div className="env__chart">
        <div className="env__chart-head">
          <h4 className="eyebrow">
            <span className="tone-dot" style={{ background: m.color }} aria-hidden />
            Last 24 hours · {m.label}
          </h4>
          <div className="seg" role="tablist" aria-label="Choose metric">
            {available.map((x) => (
              <button
                key={x.id}
                role="tab"
                aria-selected={metric === x.id}
                className={metric === x.id ? 'is-on' : undefined}
                onClick={() => setMetric(x.id)}
              >
                {metric === x.id && <motion.span layoutId="seg-pill" className="seg__pill" transition={{ duration: 0.45, ease }} />}
                <span className="seg__label">
                  <i className="seg__dot" style={{ background: x.color }} aria-hidden />
                  {x.label}
                </span>
              </button>
            ))}
          </div>
        </div>
        <LiveChart
          times={data.series.time}
          values={data.series[metric]}
          unit={m.unit}
          decimals={m.decimals}
          label={m.label}
          color={m.color}
          bands={metric === 'pm25' ? pm25Bands : undefined}
          zone={zone}
        />
        {metric === 'pm25' && <p className="env__legend mono muted">Shaded zones: US EPA AQI categories for PM2.5</p>}
        <details className="env__table">
          <summary className="mono">View as table</summary>
          <div className="env__table-wrap">
            <table>
              <caption className="sr-only">{m.label}, hourly, last 24 hours</caption>
              <thead>
                <tr>
                  <th scope="col">Time ({zone})</th>
                  <th scope="col">{m.label}</th>
                </tr>
              </thead>
              <tbody>
                {data.series.time.map((t, i) => (
                  <tr key={t}>
                    <td>{t.replace('T', ' ')}</td>
                    <td>{data.series[metric][i] == null ? '—' : `${(data.series[metric][i] as number).toFixed(m.decimals)}${m.unit}`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </div>
      <p className="env__note mono muted">Modelled readings for the area from Open-Meteo’s weather and air-quality APIs, not an on-site sensor.</p>
    </div>
  )
}

function Stat({
  icon,
  label,
  value,
  unit,
  decimals = 0,
  color,
  meter,
  status,
  spark,
}: {
  icon?: React.ReactNode
  label: string
  value: number | null
  unit: string
  decimals?: number
  /** Identity colour for measured quantities that also appear in the chart. */
  color?: string
  /** 0–1 fill for a small range bar. */
  meter?: number
  /** Health category — colours the bar and adds a text label. */
  status?: { label: string; tone: string; meter: number }
  spark?: number[]
}) {
  const style = color ? ({ '--chip': color } as React.CSSProperties) : undefined
  const fill = status ? status.meter : meter
  return (
    <motion.div className={`stat spot ${color ? 'stat--id' : ''}`} style={style} variants={fadeUp}>
      <dt className="eyebrow">
        {icon ? <span className="chip-icon">{icon}</span> : color ? <span className="stat__swatch" aria-hidden /> : null}
        {label}
      </dt>
      <dd className="mono">
        {value == null ? (
          <span className="muted">—</span>
        ) : (
          <>
            <CountUp value={value} decimals={decimals} />
            <span className="stat__unit">{unit}</span>
          </>
        )}
      </dd>
      {spark && spark.length > 2 ? (
        <MiniSpark values={spark} />
      ) : fill != null && value != null ? (
        <div className={`meter ${status ? `meter--${status.tone}` : ''}`} aria-hidden>
          <motion.span initial={{ scaleX: 0 }} whileInView={{ scaleX: Math.max(0.03, fill) }} viewport={{ once: true }} transition={{ duration: 1.1, ease, delay: 0.2 }} />
        </div>
      ) : null}
      {status && value != null && (
        <span className="stat__status">
          <span className={`tone-dot tone-dot--${status.tone}`} aria-hidden />
          {status.label}
        </span>
      )}
    </motion.div>
  )
}

function MiniSpark({ values }: { values: number[] }) {
  const W = 100
  const H = 22
  const min = Math.min(...values)
  const span = Math.max(...values) - min || 1
  const d = values.map((v, i) => `${i ? 'L' : 'M'}${((i / (values.length - 1)) * W).toFixed(1)},${(H - 2 - ((v - min) / span) * (H - 4)).toFixed(1)}`).join(' ')
  return (
    <svg className="stat__spark" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden>
      <motion.path d={d} initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.4, ease }} />
    </svg>
  )
}

function AqiGauge({ aqi }: { aqi: number }) {
  const lvl = aqiLevel(aqi)
  const max = 300
  const frac = Math.min(1, aqi / max)
  const R = 64
  const pt = (f: number, r = R) => {
    const ang = Math.PI * (1 - f)
    return [80 + r * Math.cos(ang), 80 - r * Math.sin(ang)] as const
  }
  const arc = (from: number, to: number, r = R) => {
    const [x0, y0] = pt(from, r)
    const [x1, y1] = pt(to, r)
    return `M${x0},${y0} A${r},${r} 0 0 1 ${x1},${y1}`
  }
  const bands: [number, number, string][] = [
    [0, 50, 'good'],
    [50, 100, 'moderate'],
    [100, 150, 'warning'],
    [150, 200, 'serious'],
    [200, 300, 'critical'],
  ]
  const [ex, ey] = pt(frac)
  return (
    <div className={`aqi spot aqi--${lvl.tone}`}>
      <span className="eyebrow">US AQI</span>
      <svg viewBox="0 0 160 92" role="img" aria-label={`Air quality index ${aqi}, ${lvl.label}`}>
        <path d={arc(0, 1, R - 13)} className="aqi__track" />
        {bands.map(([f, t, tone]) => (
          <path key={tone} d={arc(f / max + 0.008, t / max - 0.008)} className={`aqi__band aqi__band--${tone}`} />
        ))}
        <motion.path
          d={arc(0, frac, R - 13)}
          className="aqi__value"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.6, ease }}
        />
        <motion.circle
          cx={ex}
          cy={ey}
          r={5}
          className="aqi__knob"
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 1.4 }}
        />
      </svg>
      <div className="aqi__num mono">
        <CountUp value={aqi} />
      </div>
      <p className="aqi__label">
        <span className={`tone-dot tone-dot--${lvl.tone}`} aria-hidden />
        {lvl.label}
      </p>
    </div>
  )
}

/* ───────────────────────────── GitHub ───────────────────────────── */

/** GitHub's own language colours (CSS lifted slightly for contrast on dark). */
const langColor: Record<string, string> = {
  Python: '#3572a5',
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  HTML: '#e34c26',
  CSS: '#8a63d2',
  Java: '#b07219',
  C: '#8a8a8a',
}

function GithubPanel() {
  const { github } = useLiveData()
  const { data, status, error, fetchedAt, refreshing, retry } = github

  return (
    <motion.article
      className="panel panel--gh spot"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={inView}
      transition={{ duration: 1, ease, delay: 0.12 }}
      aria-labelledby="gh-title"
    >
      <header className="panel__head">
        <div>
          <h3 id="gh-title" className="panel__title">
            <Github aria-hidden size={16} /> @{site.live.githubUser}
          </h3>
          <p className="mono muted panel__sub">public activity</p>
        </div>
        <PanelStatus fetchedAt={fetchedAt} refreshing={refreshing} error={error} onRetry={retry} source="GitHub API" />
      </header>
      {status === 'error' && !data ? (
        <PanelError message={error ?? ''} onRetry={retry} />
      ) : !data ? (
        <div aria-busy="true" aria-label="Loading GitHub data">
          <span className="skeleton" style={{ height: 64 }} />
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="skeleton" style={{ height: 52, marginTop: 12 }} />
          ))}
        </div>
      ) : (
        <GithubBody data={data} />
      )}
    </motion.article>
  )
}

function GithubBody({ data }: { data: GithubSnapshot }) {
  const now = useNow(30_000)
  const [tab, setTab] = useState<'repos' | 'activity'>('repos')
  const pushes = data.events.filter((e) => e.type === 'PushEvent' || e.type === 'CreateEvent').slice(0, 6)
  const since = new Date(data.user.created_at).getFullYear()

  return (
    <div className="gh">
      <dl className="gh__stats">
        <div style={{ '--chip': '#3987e5' } as React.CSSProperties}>
          <dt className="eyebrow">Public repos</dt>
          <dd className="mono">
            <CountUp value={data.user.public_repos} />
          </dd>
        </div>
        <div style={{ '--chip': '#c4579a' } as React.CSSProperties}>
          <dt className="eyebrow">Followers</dt>
          <dd className="mono">
            <CountUp value={data.user.followers} />
          </dd>
        </div>
        <div style={{ '--chip': '#1baf7a' } as React.CSSProperties}>
          <dt className="eyebrow">On GitHub since</dt>
          <dd className="mono">{since}</dd>
        </div>
      </dl>

      <LangBar repos={data.repos} />

      <div className="seg seg--full" role="tablist" aria-label="GitHub view">
        {(['repos', 'activity'] as const).map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? 'is-on' : undefined} onClick={() => setTab(t)}>
            {tab === t && <motion.span layoutId="gh-pill" className="seg__pill" transition={{ duration: 0.45, ease }} />}
            <span>{t === 'repos' ? 'Recently updated' : 'Activity'}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === 'repos' ? (
          <motion.ul key="repos" className="gh__list" initial="hidden" animate="show" exit={{ opacity: 0, y: -8 }} variants={stagger(0.06)}>
            {data.repos.slice(0, 5).map((r) => (
              <motion.li key={r.id} variants={fadeUp}>
                <a
                  href={r.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className="gh__repo spot"
                  style={{ '--lang': r.language ? (langColor[r.language] ?? 'var(--text-3)') : 'var(--line-3)' } as React.CSSProperties}
                >
                  <FolderGit2 aria-hidden size={15} className="gh__icon" />
                  <span className="gh__name">{r.name}</span>
                  <span className="gh__meta mono">
                    {r.language && (
                      <span className="gh__lang">
                        <i style={{ background: langColor[r.language] ?? 'var(--text-3)' }} aria-hidden />
                        {r.language}
                      </span>
                    )}
                    <span>{timeAgo(r.pushed_at, now)}</span>
                  </span>
                  <ArrowUpRight aria-hidden size={15} className="gh__go" />
                </a>
              </motion.li>
            ))}
          </motion.ul>
        ) : (
          <motion.ul key="activity" className="gh__list gh__feed" initial="hidden" animate="show" exit={{ opacity: 0, y: -8 }} variants={stagger(0.06)}>
            {pushes.length === 0 ? (
              <motion.li variants={fadeUp} className="muted gh__empty">
                No public push events in the last 90 days — GitHub only exposes recent activity.
              </motion.li>
            ) : (
              pushes.map((e) => (
                <motion.li key={e.id} variants={fadeUp} className={`gh__event gh__event--${e.type === 'PushEvent' ? 'push' : 'create'}`}>
                  <GitCommitHorizontal aria-hidden size={15} className="gh__icon" />
                  <div>
                    <p>{describeEvent(e)}</p>
                    <span className="mono muted">
                      {e.repo.name.split('/')[1]} · {timeAgo(e.created_at, now)}
                    </span>
                  </div>
                </motion.li>
              ))
            )}
          </motion.ul>
        )}
      </AnimatePresence>

      <a className="link-arrow gh__profile" href={site.contact.github} target="_blank" rel="noreferrer">
        Full profile on GitHub <ArrowUpRight aria-hidden />
      </a>
    </div>
  )
}

/** Share of public repos by primary language. */
function LangBar({ repos }: { repos: GithubSnapshot['repos'] }) {
  const counts = new Map<string, number>()
  for (const r of repos) counts.set(r.language ?? 'Other', (counts.get(r.language ?? 'Other') ?? 0) + 1)
  const total = repos.length || 1
  const rows = [...counts.entries()].sort((x, y) => y[1] - x[1])
  return (
    <div className="langs">
      <motion.div
        className="langs__bar"
        role="img"
        aria-label={`Repository languages: ${rows.map(([l, n]) => `${l} ${n}`).join(', ')}`}
        initial={{ clipPath: 'inset(0 100% 0 0 round 8px)' }}
        whileInView={{ clipPath: 'inset(0 0% 0 0 round 8px)' }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease }}
      >
        {rows.map(([l, n]) => (
          <span key={l} style={{ background: langColor[l] ?? 'var(--text-3)', flexGrow: n }} />
        ))}
      </motion.div>
      <ul className="langs__legend mono">
        {rows.map(([l, n]) => (
          <li key={l}>
            <i style={{ background: langColor[l] ?? 'var(--text-3)' }} aria-hidden />
            {l} <span className="muted">{Math.round((n / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function describeEvent(e: GhEvent) {
  if (e.type === 'PushEvent') {
    const msg = e.payload.commits?.[e.payload.commits.length - 1]?.message?.split('\n')[0]
    return msg ? `“${msg}”` : 'Pushed commits'
  }
  if (e.type === 'CreateEvent') return `Created ${e.payload.ref_type}${e.payload.ref ? ` ${e.payload.ref}` : ''}`
  return e.type.replace('Event', '')
}
