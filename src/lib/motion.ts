import type { Transition, Variants } from 'motion/react'

/** Shared easing — a long, soft deceleration used across the site. */
export const ease = [0.22, 1, 0.36, 1] as const
export const easeInOut = [0.65, 0, 0.35, 1] as const

export const spring: Transition = { type: 'spring', stiffness: 260, damping: 26, mass: 0.6 }

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease } },
}

export const fade: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.9, ease } },
}

/** Text that slides up from behind a clipping mask. */
export const maskUp: Variants = {
  hidden: { y: '110%' },
  show: { y: '0%', transition: { duration: 1.05, ease } },
}

export const stagger = (step = 0.08, delay = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: step, delayChildren: delay } },
})

/** Default viewport settings for scroll reveals. */
export const inView = { once: true, margin: '0px 0px -12% 0px' } as const
