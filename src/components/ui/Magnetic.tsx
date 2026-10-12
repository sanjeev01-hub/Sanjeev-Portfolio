import { motion, useMotionValue, useSpring } from 'motion/react'
import { useRef, type ReactNode, type PointerEvent } from 'react'
import { useFinePointer } from '../../hooks/useMedia'

/** Pulls its child gently towards the pointer. Desktop only. */
export function Magnetic({ children, strength = 0.28, className }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const fine = useFinePointer()
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 18, mass: 0.5 })
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 18, mass: 0.5 })

  const onMove = (e: PointerEvent) => {
    if (!fine || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    x.set((e.clientX - (r.left + r.width / 2)) * strength)
    y.set((e.clientY - (r.top + r.height / 2)) * strength)
  }
  const reset = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.span
      ref={ref}
      className={className}
      style={{ x, y, display: 'inline-flex' }}
      onPointerMove={onMove}
      onPointerLeave={reset}
      whileTap={{ scale: 0.96 }}
    >
      {children}
    </motion.span>
  )
}
