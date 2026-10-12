import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from 'motion/react'
import { useRef } from 'react'

const wrap = (min: number, max: number, v: number) => {
  const r = max - min
  return ((((v - min) % r) + r) % r) + min
}

/** An endless strip that drifts on its own and speeds up / reverses with scroll velocity. */
export function Marquee({ items, baseVelocity = -2.2 }: { items: string[]; baseVelocity?: number }) {
  const reduce = useReducedMotion()
  const base = useMotionValue(0)
  const { scrollY } = useScroll()
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 })
  const factor = useTransform(velocity, [0, 1000], [0, 4], { clamp: false })
  const x = useTransform(base, (v) => `${wrap(-25, 0, v)}%`)
  const dir = useRef(1)

  useAnimationFrame((_, delta) => {
    if (reduce) return
    let move = dir.current * baseVelocity * (delta / 1000)
    const f = factor.get()
    if (f < 0) dir.current = -1
    else if (f > 0) dir.current = 1
    move += dir.current * move * f
    base.set(base.get() + move)
  })

  const row = (
    <>
      {items.map((it) => (
        <span className="marquee__item" key={it}>
          {it}
          <span className="marquee__sep" aria-hidden>
            ✦
          </span>
        </span>
      ))}
    </>
  )

  return (
    <div className="marquee" aria-label={`Technologies: ${items.join(', ')}`} role="img">
      <motion.div className="marquee__track" style={{ x }} aria-hidden>
        {row}
        {row}
        {row}
        {row}
      </motion.div>
    </div>
  )
}
