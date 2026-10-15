import { useEffect, useRef } from 'react'

/**
 * Hero background: a field of slow waveforms, like sensor traces on a scope.
 * Lines bend gently towards the pointer. Pauses off-screen and when the tab
 * is hidden; renders a single still frame for reduced-motion users.
 */
export function SignalField() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let w = 0
    let h = 0
    let dpr = 1
    let lines = 0
    let raf = 0
    let running = false
    let t = Math.random() * 1000
    const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999 }

    const resize = () => {
      const r = canvas.getBoundingClientRect()
      dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      w = r.width
      h = r.height
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      lines = w < 640 ? 14 : 24
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      mouse.x += (mouse.tx - mouse.x) * 0.08
      mouse.y += (mouse.ty - mouse.y) * 0.08
      const step = w < 640 ? 10 : 8
      const gap = h / (lines + 1)
      for (let i = 0; i < lines; i++) {
        const base = gap * (i + 1)
        const highlight = i === Math.floor(lines * 0.62)
        const phase = i * 0.55
        ctx.beginPath()
        for (let x = -step; x <= w + step; x += step) {
          const n = x / w
          // envelope: calm at the edges, livelier towards the right
          const env = 0.25 + 0.75 * Math.sin(Math.PI * Math.min(1, n * 1.1))
          let y =
            base +
            Math.sin(n * 7 + t * 0.6 + phase) * 7 * env +
            Math.sin(n * 17 - t * 0.9 + phase * 1.7) * 3 * env +
            Math.sin(n * 41 + t * 1.6 + i) * 1.2 * env
          const dx = x - mouse.x
          const dy = base - mouse.y
          const d2 = dx * dx + dy * dy
          const r = 190
          if (d2 < r * r * 4) {
            const f = Math.exp(-d2 / (r * r))
            y += Math.sin(x * 0.05 - t * 3) * 14 * f - dy * 0.22 * f
          }
          if (x === -step) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        if (highlight) {
          ctx.strokeStyle = 'rgba(91,140,255,0.55)'
          ctx.lineWidth = 1.4
        } else {
          const a = 0.05 + 0.06 * Math.sin((i / lines) * Math.PI)
          ctx.strokeStyle = `rgba(237,235,230,${a.toFixed(3)})`
          ctx.lineWidth = 1
        }
        ctx.stroke()
      }
    }

    const loop = () => {
      t += 0.012
      draw()
      raf = requestAnimationFrame(loop)
    }
    const start = () => {
      if (running || reduce) return
      running = true
      raf = requestAnimationFrame(loop)
    }
    const stop = () => {
      running = false
      cancelAnimationFrame(raf)
    }

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      mouse.tx = e.clientX - r.left
      mouse.ty = e.clientY - r.top
    }
    const onLeave = () => {
      mouse.tx = -9999
      mouse.ty = -9999
    }

    resize()
    draw()
    // hold the animation until the page has loaded and gone idle, so it doesn't compete with first render
    let deferred = true
    const begin = () => {
      deferred = false
      if (visible && !document.hidden) start()
    }
    let visible = false
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1))
    const kick = () => window.setTimeout(() => idle(begin), 1200)
    if (document.readyState === 'complete') kick()
    else window.addEventListener('load', kick, { once: true })
    const ro = new ResizeObserver(() => {
      resize()
      draw()
    })
    ro.observe(canvas)
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (deferred) return
      if (visible) start()
      else stop()
    })
    io.observe(canvas)
    const onVis = () => (document.hidden || deferred ? stop() : start())
    document.addEventListener('visibilitychange', onVis)
    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerleave', onLeave)

    return () => {
      stop()
      window.removeEventListener('load', kick)
      ro.disconnect()
      io.disconnect()
      document.removeEventListener('visibilitychange', onVis)
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return <canvas ref={ref} className="hero__canvas" aria-hidden />
}
