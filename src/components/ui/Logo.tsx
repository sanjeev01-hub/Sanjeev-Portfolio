/** Circuit "S" monogram, white on transparent (public/logo-mark.png, 477×516). */
const MARK_SRC = `${import.meta.env.BASE_URL}logo-mark.png`
const MARK_RATIO = 477 / 516

export function LogoMark({ height = 32, className }: { height?: number; className?: string }) {
  return (
    <img
      className={`logo-mark ${className ?? ''}`}
      src={MARK_SRC}
      height={height}
      width={Math.round(height * MARK_RATIO)}
      alt=""
      aria-hidden
      decoding="async"
    />
  )
}

/** Mark + letter-spaced name, as in the brand lockup. */
export function Logo({ height = 30 }: { height?: number }) {
  return (
    <span className="logo">
      <LogoMark height={height} />
      <span className="logo__word">
        <span>Sanjeev</span> <span className="logo__accent">Sharma</span>
      </span>
    </span>
  )
}
