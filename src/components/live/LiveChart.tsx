import { motion } from 'motion/react'
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { ease } from '../../lib/motion'

export interface Band {
  from: number
  to: number
  tone: string
  label: string
}

interface Props {
  times: string[]
  values: (number | null)[]
  unit: string
  decimals?: number
  label: string
  /** CSS colour for the series (a token like var(--c-temp)). */
  color?: string
  /** Optional reference zones drawn behind the line, e.g. AQI categories. */
  bands?: Band[]
}

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [w, setW] = useState(0)
  useEffect(() => {
    if (!ref.current) return
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width))
    ro.observe(ref.current)
    return () => ro.disconnect()
  }, [])
  return [ref, w] as const
}

const hourLabel = (t: string) => t.slice(11, 16)

/** Single-series line + area with crosshair tooltip and keyboard navigation. */
export function LiveChart({ times, values, unit, decimals = 1, label, color = 'var(--accent)', bands }: Props) {
  const [wrapRef, width] = useWidth<HTMLDivElement>()
  const [hover, setHover] = useState<number | null>(null)
  const gradId = useId()
  const H = 240
  const pad = { t: 18, r: 12, b: 28, l: 44 }
  const w = Math.max(0, width)
  const innerW = Math.max(1, w - pad.l - pad.r)
  const innerH = H - pad.t - pad.b

  const geo = useMemo(() => {
    const nums = values.filter((v): v is number => v != null)
    if (!nums.length) return null
    let min = Math.min(...nums)
    let max = Math.max(...nums)
    if (max - min < 1e-6) {
      min -= 1
      max += 1
    }
    const span = max - min
    min -= span * 0.12
    max += span * 0.12
    const x = (i: number) => pad.l + (values.length <= 1 ? 0 : (i / (values.length - 1)) * innerW)
    const y = (v: number) => pad.t + innerH - ((v - min) / (max - min)) * innerH
    // build segments, breaking the line where data is missing
    let line = ''
    let area = ''
    let segStart = -1
    values.forEach((v, i) => {
      if (v == null) {
        if (segStart >= 0) area += `L${x(i - 1)},${pad.t + innerH} L${x(segStart)},${pad.t + innerH} Z `
        segStart = -1
        return
      }
      if (segStart < 0) {
        segStart = i
        line += `M${x(i)},${y(v)} `
        area += `M${x(i)},${y(v)} `
      } else {
        line += `L${x(i)},${y(v)} `
        area += `L${x(i)},${y(v)} `
      }
    })
    if (segStart >= 0) area += `L${x(values.length - 1)},${pad.t + innerH} L${x(segStart)},${pad.t + innerH} Z`
    const ticks = [0.12, 0.5, 0.88].map((f) => min + (max - min) * f)
    return { x, y, line, area, min, max, ticks }
  }, [values, innerW, innerH, pad.l, pad.t])

  const onMove = (e: PointerEvent<SVGSVGElement>) => {
    if (!geo) return
    const r = e.currentTarget.getBoundingClientRect()
    const rel = (e.clientX - r.left - pad.l) / innerW
    const i = Math.round(rel * (values.length - 1))
    setHover(Math.max(0, Math.min(values.length - 1, i)))
  }
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') setHover((h) => Math.min(values.length - 1, (h ?? values.length - 2) + 1))
    else if (e.key === 'ArrowLeft') setHover((h) => Math.max(0, (h ?? values.length) - 1))
    else if (e.key === 'Escape') setHover(null)
  }

  const last = values.length - 1
  const active = hover ?? null
  const fmt = (v: number | null) => (v == null ? 'no data' : `${v.toFixed(decimals)}${unit}`)
  const labelIdx = [0, Math.round(last / 4), Math.round(last / 2), Math.round((3 * last) / 4), last]

  return (
    <div className="lchart" ref={wrapRef}>
      {w > 0 && geo && (
        <svg
          width={w}
          height={H}
          role="img"
          aria-label={`${label}, last 24 hours. Latest ${fmt(values[last])}. Use left and right arrow keys to inspect hours.`}
          tabIndex={0}
          onPointerMove={onMove}
          onPointerLeave={() => setHover(null)}
          onKeyDown={onKey}
          onBlur={() => setHover(null)}
        >
          <defs>
            <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.42" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>

          {bands?.map((b) => {
            const top = Math.max(pad.t, geo.y(Math.min(b.to, geo.max)))
            const bottom = Math.min(pad.t + innerH, geo.y(Math.max(b.from, geo.min)))
            if (bottom - top <= 0.5) return null
            return (
              <g key={b.label}>
                <rect x={pad.l} y={top} width={innerW} height={bottom - top} className={`lchart__band lchart__band--${b.tone}`} />
                <rect x={w - pad.r - 3} y={top} width={3} height={bottom - top} className={`lchart__band-edge lchart__band-edge--${b.tone}`} />
                {bottom - top > 16 && (
                  <text x={w - pad.r - 10} y={top + 13} textAnchor="end" className="lchart__band-label">
                    {b.label}
                  </text>
                )}
              </g>
            )
          })}
          {geo.ticks.map((t, i) => (
            <g key={i}>
              <line x1={pad.l} x2={w - pad.r} y1={geo.y(t)} y2={geo.y(t)} className="lchart__grid" />
              <text x={pad.l - 10} y={geo.y(t)} className="lchart__tick" textAnchor="end" dominantBaseline="middle">
                {t.toFixed(t > 100 ? 0 : decimals)}
              </text>
            </g>
          ))}
          {labelIdx.map((i) => (
            <text key={i} x={geo.x(i)} y={H - 8} className="lchart__tick" textAnchor={i === 0 ? 'start' : i === last ? 'end' : 'middle'}>
              {i === last ? 'Now' : hourLabel(times[i])}
            </text>
          ))}

          <motion.path
            key={`a-${label}`}
            d={geo.area}
            fill={`url(#${gradId})`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.4 }}
          />
          <motion.path
            key={`l-${label}`}
            d={geo.line}
            className="lchart__line"
            style={{ stroke: color }}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.6, ease }}
          />

          {/* latest reading marker */}
          {values[last] != null && (
            <g>
              <circle cx={geo.x(last)} cy={geo.y(values[last] as number)} r={9} className="lchart__halo" style={{ fill: color }} />
              <circle cx={geo.x(last)} cy={geo.y(values[last] as number)} r={4.5} className="lchart__dot" style={{ fill: color }} />
            </g>
          )}

          {active != null && (
            <g pointerEvents="none">
              <line x1={geo.x(active)} x2={geo.x(active)} y1={pad.t} y2={pad.t + innerH} className="lchart__cross" />
              {values[active] != null && <circle cx={geo.x(active)} cy={geo.y(values[active] as number)} r={5} className="lchart__dot lchart__dot--hover" />}
            </g>
          )}
          {/* full-height hit area */}
          <rect x={pad.l} y={pad.t} width={innerW} height={innerH} fill="transparent" />
        </svg>
      )}
      {w > 0 && geo && active != null && (
        <div
          className="lchart__tip"
          style={{
            left: Math.min(Math.max(geo.x(active), 70), w - 70),
            top: values[active] != null ? geo.y(values[active] as number) - 14 : pad.t,
          }}
          aria-hidden
        >
          <span className="mono muted">{hourLabel(times[active])} IST</span>
          <b className="mono">
            <i className="lchart__swatch" style={{ background: color }} aria-hidden />
            {fmt(values[active])}
          </b>
        </div>
      )}
      {w > 0 && !geo && <p className="lchart__empty muted">No readings available for this metric right now.</p>}
      <div className="sr-only" aria-live="polite">
        {active != null ? `${hourLabel(times[active])}: ${fmt(values[active])}` : ''}
      </div>
    </div>
  )
}
