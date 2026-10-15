/**
 * Original, illustrative interface mockups for the project cards.
 * They show the *kind* of interface each project has — not screenshots,
 * and the figures in them are placeholders. Swap in real screenshots
 * by replacing a mockup with an <img> when you have them.
 */
import { motion, useReducedMotion } from 'motion/react'
import {
  BatteryFull,
  Check,
  CloudOff,
  Droplets,
  Fan,
  Fish,
  Gauge,
  Gavel,
  Lightbulb,
  RefreshCw,
  Signal,
  Thermometer,
  TrendingUp,
  Wifi,
  Wind,
} from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import type { MockupKind } from '../../content/projects'

export function Mockup({ kind }: { kind: MockupKind }) {
  if (kind === 'mandi') return <MandiMockup />
  if (kind === 'iot') return <IotMockup />
  return <MobileMockup />
}

function useTicker(values: number[], ms: number) {
  const reduce = useReducedMotion()
  const [i, setI] = useState(0)
  useEffect(() => {
    if (reduce) return
    const id = window.setInterval(() => setI((n) => (n + 1) % values.length), ms)
    return () => window.clearInterval(id)
  }, [values.length, ms, reduce])
  return values[i]
}

/** iPhone-style device: titanium frame, side buttons, Dynamic Island, status bar, home indicator. */
function Phone({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`phone ${className}`}>
      <span className="phone__btn phone__btn--action" />
      <span className="phone__btn phone__btn--vol-up" />
      <span className="phone__btn phone__btn--vol-down" />
      <span className="phone__btn phone__btn--power" />
      <div className="phone__bezel">
        <div className="phone__screen">
          <div className="phone__island" />
          <div className="phone__status">
            <span>9:41</span>
            <span className="phone__icons">
              <Signal size={9} strokeWidth={2.6} />
              <Wifi size={9} strokeWidth={2.6} />
              <BatteryFull size={11} strokeWidth={2.2} />
            </span>
          </div>
          <div className="phone__body">{children}</div>
          <div className="phone__home" />
        </div>
      </div>
    </div>
  )
}

/* ───────────── 01 · Fish mandi ───────────── */

const bids = [4280, 4310, 4350, 4395, 4420, 4460]
const lots = [
  { name: 'Katla', qty: '30 kg', status: 'Sold', tone: 'amber' },
  { name: 'Pomfret', qty: '18 kg', status: 'Queued', tone: 'pink' },
  { name: 'Hilsa', qty: '12 kg', status: 'Queued', tone: 'teal' },
]

function MandiMockup() {
  const bid = useTicker(bids, 1600)
  const step = bids.indexOf(bid) + 1
  return (
    <div className="mk mk--mandi" aria-hidden>
      <Phone>
        <div className="app-head">
          <span className="app-icon">
            <Fish size={12} strokeWidth={2.4} />
          </span>
          <span className="app-head__text">
            <b>Auction floor</b>
            <small>Market · Today</small>
          </span>
          <span className="mk-pill mk-pill--live">
            <i /> LIVE
          </span>
        </div>

        <div className="lot">
          <div className="lot__top">
            <span className="lot__tag">LOT A-14</span>
            <span className="mk-k">Supplier S-07</span>
          </div>
          <div className="lot__name">
            <span className="lot__fish">
              <Fish size={13} strokeWidth={2.2} />
            </span>
            Rohu <span>· 42 kg</span>
          </div>
          <div className="lot__bid">
            <span className="mk-k">Current bid</span>
            <motion.span key={bid} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4 }}>
              ₹{bid.toLocaleString('en-IN')}
            </motion.span>
          </div>
          <div className="lot__bar">
            <motion.span animate={{ scaleX: step / bids.length }} transition={{ duration: 0.6 }} />
          </div>
          <div className="lot__meta">
            <span>
              <Gavel size={9} /> {step + 2} bids
            </span>
            <span className="lot__up">
              <TrendingUp size={9} /> rising
            </span>
          </div>
        </div>

        <ul className="lots">
          {lots.map((l) => (
            <li key={l.name}>
              <span className={`lots__avatar lots__avatar--${l.tone}`}>{l.name[0]}</span>
              <span className="lots__name">
                {l.name} <small>· {l.qty}</small>
              </span>
              <span className={`lots__status lots__status--${l.status.toLowerCase()}`}>{l.status}</span>
            </li>
          ))}
        </ul>

        <div className="mk-btn">Record transaction</div>
      </Phone>

      <div className="mk-float mk-float--settle">
        <div className="mk-k">Settlement · Today</div>
        <div className="mk-rows">
          <div>
            <span>Gross sales</span>
            <span className="tone-green">Σ lots</span>
          </div>
          <div>
            <span>Agent commission</span>
            <span className="tone-amber">− rate</span>
          </div>
          <div className="mk-rows__total">
            <span>Net to supplier</span>
            <span className="tone-blue">Calculated</span>
          </div>
        </div>
      </div>

      <div className="mk-float mk-float--roles">
        {['Supplier', 'Agent', 'Buyer'].map((r, i) => (
          <span key={r} className={i === 1 ? 'is-on' : undefined}>
            {r}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ───────────── 02 · IoT dashboard ───────────── */

const iotPath =
  'M0,62 C20,58 30,40 50,44 C70,48 80,30 100,28 C120,26 130,46 150,42 C170,38 180,18 200,22 C220,26 230,40 250,34 C270,28 280,12 300,16'

function IotMockup() {
  const co2 = useTicker([612, 618, 624, 619, 631, 627], 1400)
  return (
    <div className="mk mk--iot" aria-hidden>
      <div className="browser">
        <div className="browser__bar">
          <i className="browser__dot browser__dot--red" />
          <i className="browser__dot browser__dot--amber" />
          <i className="browser__dot browser__dot--green" />
          <span className="browser__url">sensors · dashboard</span>
        </div>
        <div className="dash">
          <aside className="dash__side">
            <span className="is-on" />
            <span />
            <span />
            <span />
          </aside>
          <div className="dash__main">
            <div className="dash__tiles">
              <div className="tile tile--orange">
                <Thermometer size={12} />
                <span className="mk-k">Temp</span>
                <b>24.6°</b>
              </div>
              <div className="tile tile--blue">
                <Droplets size={12} />
                <span className="mk-k">Humidity</span>
                <b>61%</b>
              </div>
              <div className="tile tile--green">
                <Gauge size={12} />
                <span className="mk-k">CO₂ ppm</span>
                <b>{co2}</b>
              </div>
              <div className="tile tile--violet">
                <Wind size={12} />
                <span className="mk-k">Gas</span>
                <b>OK</b>
              </div>
            </div>
            <div className="dash__chart">
              <div className="dash__chart-head">
                <span className="mk-k">InfluxDB · last 24 h</span>
                <span className="mk-pill mk-pill--ok">MQTT ●</span>
              </div>
              <svg viewBox="0 0 300 80" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="iot-line" x1="0" x2="1">
                    <stop offset="0" stopColor="#22d3ee" />
                    <stop offset=".55" stopColor="#5b8cff" />
                    <stop offset="1" stopColor="#a78bfa" />
                  </linearGradient>
                  <linearGradient id="iot-area" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0" stopColor="#5b8cff" stopOpacity=".35" />
                    <stop offset="1" stopColor="#5b8cff" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[20, 40, 60].map((y) => (
                  <line key={y} x1="0" x2="300" y1={y} y2={y} className="dash__grid" />
                ))}
                <path d={`${iotPath} L300,80 L0,80 Z`} fill="url(#iot-area)" />
                <path d={iotPath} className="dash__line" stroke="url(#iot-line)" pathLength={1} />
              </svg>
            </div>
            <div className="dash__devices">
              <div>
                <Fan size={13} className="tone-teal" />
                <span>Exhaust fan</span>
                <span className="mk-toggle is-on" />
              </div>
              <div>
                <Lightbulb size={13} className="tone-amber" />
                <span>Relay 02</span>
                <span className="mk-toggle" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mk-float mk-float--alert">
        <span className="alert-dot" />
        <div>
          <b>Threshold alert</b>
          <span className="mk-k">CO₂ above configured limit</span>
        </div>
      </div>
    </div>
  )
}

/* ───────────── 03 · React Native apps ───────────── */

const recordTones = ['violet', 'blue', 'teal', 'amber', 'pink']

function MobileMockup() {
  const reduce = useReducedMotion()
  const [synced, setSynced] = useState(false)
  useEffect(() => {
    if (reduce) return
    const id = window.setInterval(() => setSynced((s) => !s), 2600)
    return () => window.clearInterval(id)
  }, [reduce])

  return (
    <div className="mk mk--mobile" aria-hidden>
      <Phone className="phone--back">
        <div className="app-head">
          <span className="app-icon app-icon--violet">+</span>
          <span className="app-head__text">
            <b>New entry</b>
            <small>Saved on device</small>
          </span>
        </div>
        <div className="mk-form">
          {['Item', 'Quantity', 'Location', 'Notes'].map((f, i) => (
            <label key={f} className={i === 1 ? 'is-focus' : undefined}>
              <span className="mk-k">{f}</span>
              <span className="mk-input" />
            </label>
          ))}
        </div>
        <div className="mk-btn mk-btn--violet">Save offline</div>
      </Phone>
      <Phone className="phone--front">
        <div className="app-head">
          <span className="app-icon">
            <RefreshCw size={11} strokeWidth={2.6} />
          </span>
          <span className="app-head__text">
            <b>Records</b>
            <small>Field app</small>
          </span>
          <motion.span className={`mk-pill ${synced ? 'mk-pill--ok' : 'mk-pill--warn'}`} layout>
            {synced ? <Check size={9} /> : <CloudOff size={9} />}
            {synced ? 'Synced' : '3 queued'}
          </motion.span>
        </div>
        <ul className="lots lots--records">
          {recordTones.map((tone, i) => (
            <li key={tone}>
              <span className={`lots__avatar lots__avatar--${tone}`}>{i + 1}</span>
              <span className="mk-lines">
                <i style={{ width: `${70 - i * 7}%` }} />
                <i style={{ width: `${45 + i * 5}%` }} />
              </span>
              {i < 3 ? (
                <motion.span
                  className={`mk-sync ${synced ? 'is-ok' : 'is-pending'}`}
                  animate={{ rotate: synced ? 0 : 360 }}
                  transition={{ duration: 1.2, repeat: synced ? 0 : Infinity, ease: 'linear' }}
                >
                  {synced ? <Check size={10} /> : <RefreshCw size={10} />}
                </motion.span>
              ) : (
                <span className="mk-sync is-ok">
                  <Check size={10} />
                </span>
              )}
            </li>
          ))}
        </ul>
      </Phone>
      <div className="mk-float mk-float--api">
        <span className="mk-method">GET</span>
        <span className="mono">/api/records</span>
        <span className={`mk-pill ${synced ? 'mk-pill--ok' : ''}`}>{synced ? '200' : '…'}</span>
      </div>
    </div>
  )
}
