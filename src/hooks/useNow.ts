import { useEffect, useState } from 'react'

/** Current time, updated on an interval. */
export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs)
    return () => window.clearInterval(id)
  }, [intervalMs])
  return now
}

const clockFormats = new Map<string, Intl.DateTimeFormat>()

/** HH:MM:SS in the given IANA time zone. */
export function formatClock(t: number, timeZone: string) {
  let f = clockFormats.get(timeZone)
  if (!f) {
    f = new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
    clockFormats.set(timeZone, f)
  }
  return f.format(t)
}

/** Short zone name such as "IST", "GMT+1" or "EDT". */
export function zoneLabel(timeZone: string) {
  if (timeZone === 'Asia/Kolkata' || timeZone === 'Asia/Calcutta') return 'IST'
  try {
    const part = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'short' }).formatToParts(Date.now()).find((p) => p.type === 'timeZoneName')
    return part?.value ?? timeZone
  } catch {
    return timeZone
  }
}
