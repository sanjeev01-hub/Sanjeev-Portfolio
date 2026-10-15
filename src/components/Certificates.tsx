import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, ArrowRight, ArrowUpRight, Expand, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react'
import { createPortal } from 'react-dom'
import { certificates, type Certificate } from '../content/profile'
import { useFinePointer } from '../hooks/useMedia'
import { ease, fadeUp, inView, stagger } from '../lib/motion'
import { Reveal } from './ui/Reveal'

const src = (c: Certificate, thumb = false) => `${import.meta.env.BASE_URL}certificates/${c.id}${thumb ? '-thumb' : ''}.webp`

/** Gallery of scanned certificates with a full-screen viewer. */
export function Certificates() {
  const [open, setOpen] = useState<number | null>(null)
  const close = useCallback(() => setOpen(null), [])

  return (
    <div className="certx">
      <Reveal>
        <div className="certx__head">
          <h3 className="eyebrow exp__label">Certificates</h3>
          <span className="mono muted certx__count">{String(certificates.length).padStart(2, '0')} documents</span>
        </div>
      </Reveal>
      <motion.ul className="certx__grid" initial="hidden" whileInView="show" viewport={inView} variants={stagger(0.1)}>
        {certificates.map((c, i) => (
          <motion.li key={c.id} variants={fadeUp}>
            <CertCard c={c} onOpen={() => setOpen(i)} />
          </motion.li>
        ))}
      </motion.ul>
      {/* portalled: transformed ancestors would otherwise trap position: fixed */}
      {createPortal(<AnimatePresence>{open != null && <Viewer index={open} onIndex={setOpen} onClose={close} />}</AnimatePresence>, document.body)}
    </div>
  )
}

function CertCard({ c, onOpen }: { c: Certificate; onOpen: () => void }) {
  const fine = useFinePointer()
  const ref = useRef<HTMLButtonElement>(null)

  // gentle tilt towards the pointer (desktop only)
  const onMove = (e: PointerEvent) => {
    const el = ref.current
    if (!fine || !el) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    el.style.setProperty('--rx', `${(-py * 6).toFixed(2)}deg`)
    el.style.setProperty('--ry', `${(px * 8).toFixed(2)}deg`)
    el.style.setProperty('--gx', `${((px + 0.5) * 100).toFixed(1)}%`)
  }
  const onLeave = () => {
    ref.current?.style.setProperty('--rx', '0deg')
    ref.current?.style.setProperty('--ry', '0deg')
  }

  return (
    <button ref={ref} type="button" className="cert" onClick={onOpen} onPointerMove={onMove} onPointerLeave={onLeave} data-cursor="View" aria-label={`View certificate: ${c.title}, ${c.issuer}`}>
      <span className="cert__frame">
        <span className="cert__paper">
          <img
            src={src(c, true)}
            width={c.thumbWidth}
            height={c.thumbHeight}
            alt=""
            loading="lazy"
            decoding="async"
            className={c.height / c.width > 0.8 ? 'cert__img cert__img--tall' : 'cert__img'}
          />
          <span className="cert__sheen" aria-hidden />
        </span>
        <span className="cert__expand" aria-hidden>
          <Expand size={14} />
        </span>
      </span>
      <span className="cert__body">
        <span className="cert__meta mono">
          <span className={`cert__kind cert__kind--${c.kind.toLowerCase()}`}>{c.kind}</span>
          <span className="muted">{c.period}</span>
        </span>
        <span className="cert__title">{c.title}</span>
        <span className="cert__issuer muted">{c.issuer}</span>
        <span className="cert__detail">{c.detail}</span>
        <span className="cert__cta link-arrow">
          View certificate <ArrowUpRight aria-hidden />
        </span>
      </span>
    </button>
  )
}

function Viewer({ index, onIndex, onClose }: { index: number; onIndex: (i: number) => void; onClose: () => void }) {
  const c = certificates[index]
  const n = certificates.length
  const closeRef = useRef<HTMLButtonElement>(null)
  const go = useCallback((d: number) => onIndex((index + d + n) % n), [index, n, onIndex])

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null
    document.body.classList.add('is-locked')
    closeRef.current?.focus()
    return () => {
      document.body.classList.remove('is-locked')
      opener?.focus()
    }
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') go(1)
      else if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, onClose])

  return (
    <motion.div
      className="viewer"
      role="dialog"
      aria-modal="true"
      aria-label={`${c.title} — ${c.issuer}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      onClick={onClose}
    >
      <div className="viewer__bar container" onClick={(e) => e.stopPropagation()}>
        <div className="viewer__info">
          <span className="mono muted">
            {String(index + 1).padStart(2, '0')} / {String(n).padStart(2, '0')} · {c.kind}
          </span>
          <strong>{c.title}</strong>
          <span className="muted">
            {c.issuer} · {c.period}
          </span>
        </div>
        <div className="viewer__actions">
          <a className="viewer__btn" href={src(c)} target="_blank" rel="noreferrer" aria-label="Open full size in a new tab">
            <ArrowUpRight size={18} aria-hidden />
          </a>
          <button ref={closeRef} type="button" className="viewer__btn" onClick={onClose} aria-label="Close">
            <X size={18} aria-hidden />
          </button>
        </div>
      </div>

      <div className="viewer__stage">
        <AnimatePresence mode="wait">
          <motion.img
            key={c.id}
            src={src(c)}
            width={c.width}
            height={c.height}
            alt={`${c.title} issued by ${c.issuer}`}
            className="viewer__img"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.45, ease }}
            onClick={(e) => e.stopPropagation()}
          />
        </AnimatePresence>
      </div>

      {n > 1 && (
        <div className="viewer__nav" onClick={(e) => e.stopPropagation()}>
          <button type="button" className="viewer__btn" onClick={() => go(-1)} aria-label="Previous certificate">
            <ArrowLeft size={18} aria-hidden />
          </button>
          <div className="viewer__dots" aria-hidden>
            {certificates.map((x, i) => (
              <span key={x.id} className={i === index ? 'is-on' : undefined} />
            ))}
          </div>
          <button type="button" className="viewer__btn" onClick={() => go(1)} aria-label="Next certificate">
            <ArrowRight size={18} aria-hidden />
          </button>
        </div>
      )}
    </motion.div>
  )
}
