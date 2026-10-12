import { motion, useInView, useReducedMotion, animate } from 'motion/react'
import { useEffect, useRef, useState, type ElementType, type ReactNode } from 'react'
import { ease, fadeUp, inView, maskUp, stagger } from '../../lib/motion'

/** Fades + lifts its children into view once. */
export function Reveal({
  children,
  delay = 0,
  className,
  as = 'div',
}: {
  children: ReactNode
  delay?: number
  className?: string
  as?: 'div' | 'li' | 'p' | 'section' | 'article' | 'span'
}) {
  const Comp = motion[as]
  return (
    <Comp
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={inView}
      variants={{ hidden: fadeUp.hidden, show: { ...fadeUp.show, transition: { duration: 0.9, ease, delay } } }}
    >
      {children}
    </Comp>
  )
}

/** Staggers direct `motion` children that use the shared `fadeUp` variants. */
export function Stagger({
  children,
  className,
  step = 0.08,
  delay = 0,
  as = 'div',
}: {
  children: ReactNode
  className?: string
  step?: number
  delay?: number
  as?: 'div' | 'ul' | 'ol' | 'dl'
}) {
  const Comp = motion[as]
  return (
    <Comp className={className} initial="hidden" whileInView="show" viewport={inView} variants={stagger(step, delay)}>
      {children}
    </Comp>
  )
}

/**
 * Splits text into words that rise from behind a mask, one after another.
 * Screen readers get the full sentence via aria-label.
 */
export function SplitText({
  text,
  as = 'span',
  className,
  delay = 0,
  step = 0.045,
  animateNow,
  id,
}: {
  text: string
  id?: string
  as?: ElementType
  className?: string
  delay?: number
  step?: number
  /** When set, animates on this flag instead of on scroll-into-view. */
  animateNow?: boolean
}) {
  const Tag = as
  const words = text.split(' ')
  const trigger =
    animateNow === undefined
      ? { initial: 'hidden', whileInView: 'show', viewport: inView }
      : { initial: 'hidden', animate: animateNow ? 'show' : 'hidden' }
  return (
    <Tag id={id} className={className} aria-label={text}>
      <motion.span aria-hidden style={{ display: 'inline' }} variants={stagger(step, delay)} {...trigger}>
        {words.map((w, i) => (
          <span className="word" key={i}>
            <motion.span variants={maskUp}>{w}</motion.span>
            {i < words.length - 1 ? ' ' : null}
          </span>
        ))}
      </motion.span>
    </Tag>
  )
}

/** Numbered section header with a drawn rule and split title. */
export function SectionHeader({
  number,
  label,
  title,
  lede,
  id,
}: {
  number: string
  label: string
  title: string
  lede?: ReactNode
  id?: string
}) {
  return (
    <header className="sec-head">
      <motion.div className="sec-head__meta" initial="hidden" whileInView="show" viewport={inView} variants={stagger(0.1)}>
        <motion.span className="sec-head__num" variants={fadeUp}>
          {number}
        </motion.span>
        <motion.span
          className="sec-head__rule"
          variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 1.1, ease } } }}
        />
        <motion.span className="eyebrow" variants={fadeUp}>
          {label}
        </motion.span>
      </motion.div>
      <SplitText as="h2" className="sec-head__title" text={title} />
      {lede ? (
        <Reveal className="sec-head__lede" delay={0.2}>
          <p id={id}>{lede}</p>
        </Reveal>
      ) : null}
    </header>
  )
}

/** Animates a number from 0 when it scrolls into view, and between values on update. */
export function CountUp({ value, decimals = 0, duration = 1.4 }: { value: number; decimals?: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const seen = useInView(ref, { once: true })
  const reduce = useReducedMotion()
  const from = useRef(0)
  const [display, setDisplay] = useState(() => (0).toFixed(decimals))

  useEffect(() => {
    if (!seen) return
    if (reduce) {
      from.current = value
      return
    }
    const controls = animate(from.current, value, {
      duration,
      ease,
      onUpdate: (v) => setDisplay(v.toFixed(decimals)),
    })
    from.current = value
    return () => controls.stop()
  }, [seen, value, decimals, duration, reduce])

  return (
    <span ref={ref} className="mono-num">
      {reduce ? value.toFixed(decimals) : display}
    </span>
  )
}
