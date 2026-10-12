import { useMotionValueEvent, useScroll } from 'motion/react'
import { useState } from 'react'

/** Hides an element while scrolling down, reveals it when scrolling up. */
export function useHideOnScroll(threshold = 120) {
  const { scrollY } = useScroll()
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  useMotionValueEvent(scrollY, 'change', (v) => {
    const prev = scrollY.getPrevious() ?? 0
    setScrolled(v > 24)
    setHidden(v > threshold && v > prev + 2 ? true : v < prev - 2 ? false : hidden)
  })
  return { hidden, scrolled }
}
