/**
 * Original, illustrative interface mockups for the project cards.
 * They show the *kind* of interface each project has — not screenshots,
 * and the figures in them are placeholders. Swap in real screenshots
 * by replacing a mockup with an <img> when you have them.
 */
import { motion, useReducedMotion } from 'motion/react'
import { CloudOff, Fan, Gauge, Lightbulb, RefreshCw, Thermometer, Droplets, Wind, Check } from 'lucide-react'
import { useEffect, useState } from 'react'
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

/* ───────────── 01 · Fish mandi ───────────── */

const bids = [4280, 4310, 4350, 4395, 4420, 4460]

function MandiMockup() {
  const bid = useTicker(bids, 1600)
  return (
    <div className="mk mk--mandi" aria-hidden>
      <div className="phone">
        <div className="phone__notch" />
        <div className="phone__screen">
          <div className="mk-app-bar">
            <span className="mk-dot" />
            <span>Auction floor</span>
            <span className="mk-pill mk-pill--live">LIVE</span>
          </div>
          <div className="mk-lot">
            <div className="mk-lot__top">
              <span className="mk-k">LOT A-14</span>
              <span className="mk-k">Supplier S-07</span>
            </div>
            <div className="mk-lot__name">Rohu · 42 kg</div>
            <div className="mk-lot__bid">
              <span className="mk-k">Current bid</span>
              <motion.span key={bid} initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4 }}>
                ₹{bid.toLocaleString('en-IN')}
              </motion.span>
            </div>
            <div className="mk-bar">
              <motion.span animate={{ scaleX: (bids.indexOf(bid) + 1) / bids.length }} transition={{ duration: 0.6 }} />
            </div>
          </div>
          <ul className="mk-list">
            {['Katla · 30 kg', 'Pomfret · 18 kg', 'Hilsa · 12 kg'].map((l, i) => (
              <li key={l}>
                <span className="mk-avatar">{String.fromCharCode(66 + i)}</span>
                <span>{l}</span>
                <span className="mk-k">{i === 0 ? 'Sold' : 'Queued'}</span>
              </li>
            ))}
          </ul>
          <div className="mk-btn">Record transaction</div>
        </div>
      </div>

      <div className="mk-float mk-float--settle">
        <div className="mk-k">Settlement · Today</div>
        <div className="mk-rows">
          <div>
            <span>Gross sales</span>
            <span>Σ lots</span>
          </div>
          <div>
            <span>Agent commission</span>
            <span>− rate</span>
          </div>
          <div className="mk-rows__total">
            <span>Net to supplier</span>
            <span>Calculated</span>
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
          <i />
          <i />
          <i />
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
              <div>
                <Thermometer size={12} />
                <span className="mk-k">Temp</span>
                <b>24.6°</b>
              </div>
              <div>
                <Droplets size={12} />
                <span className="mk-k">Humidity</span>
                <b>61%</b>
              </div>
              <div className="is-accent">
                <Gauge size={12} />
                <span className="mk-k">CO₂ ppm</span>
                <b>{co2}</b>
              </div>
              <div>
                <Wind size={12} />
                <span className="mk-k">Gas</span>
                <b>OK</b>
              </div>
            </div>
            <div className="dash__chart">
              <div className="dash__chart-head">
                <span className="mk-k">InfluxDB · last 24 h</span>
                <span className="mk-pill">MQTT ●</span>
              </div>
              <svg viewBox="0 0 300 80" preserveAspectRatio="none">
                {[20, 40, 60].map((y) => (
                  <line key={y} x1="0" x2="300" y1={y} y2={y} className="dash__grid" />
                ))}
                <path d={`${iotPath} L300,80 L0,80 Z`} className="dash__area" />
                <path d={iotPath} className="dash__line" pathLength={1} />
              </svg>
            </div>
            <div className="dash__devices">
              <div>
                <Fan size={13} />
                <span>Exhaust fan</span>
                <span className="mk-toggle is-on" />
              </div>
              <div>
                <Lightbulb size={13} />
                <span>Relay 02</span>
                <span className="mk-toggle" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mk-float mk-float--alert">
        <span className="tone-dot tone-dot--warning" />
        <div>
          <b>Threshold alert</b>
          <span className="mk-k">CO₂ above configured limit</span>
        </div>
      </div>
    </div>
  )
}

/* ───────────── 03 · React Native apps ───────────── */

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
      <div className="phone phone--back">
        <div className="phone__notch" />
        <div className="phone__screen">
          <div className="mk-app-bar">
            <span>New entry</span>
          </div>
          <div className="mk-form">
            {['Item', 'Quantity', 'Location', 'Notes'].map((f) => (
              <label key={f}>
                <span className="mk-k">{f}</span>
                <span className="mk-input" />
              </label>
            ))}
          </div>
          <div className="mk-btn">Save offline</div>
        </div>
      </div>
      <div className="phone phone--front">
        <div className="phone__notch" />
        <div className="phone__screen">
          <div className="mk-app-bar">
            <span>Records</span>
            <motion.span className={`mk-pill ${synced ? 'mk-pill--ok' : 'mk-pill--warn'}`} layout>
              {synced ? <Check size={10} /> : <CloudOff size={10} />}
              {synced ? 'Synced' : '3 queued'}
            </motion.span>
          </div>
          <ul className="mk-list mk-list--records">
            {[0, 1, 2, 3, 4].map((i) => (
              <li key={i}>
                <span className="mk-avatar">{i + 1}</span>
                <span className="mk-lines">
                  <i style={{ width: `${70 - i * 7}%` }} />
                  <i style={{ width: `${45 + i * 5}%` }} />
                </span>
                {i < 3 ? (
                  <motion.span className="mk-sync" animate={{ rotate: synced ? 0 : 360 }} transition={{ duration: 1.2, repeat: synced ? 0 : Infinity, ease: 'linear' }}>
                    {synced ? <Check size={11} /> : <RefreshCw size={11} />}
                  </motion.span>
                ) : (
                  <span className="mk-sync">
                    <Check size={11} />
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mk-float mk-float--api">
        <span className="mono">GET /api/records</span>
        <span className={`mk-pill ${synced ? 'mk-pill--ok' : ''}`}>{synced ? '200' : '…'}</span>
      </div>
    </div>
  )
}
