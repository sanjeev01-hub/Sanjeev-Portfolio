import { site } from '../config/site'

const TIMEOUT_MS = 12_000

/** fetch + JSON with a timeout and a short sessionStorage cache (keeps us under API rate limits). */
export async function fetchJSON<T>(
  url: string,
  cacheKey: string,
  maxAgeMs: number,
  signal?: AbortSignal,
): Promise<{ data: T; fetchedAt: number }> {
  try {
    const raw = sessionStorage.getItem(cacheKey)
    if (raw) {
      const cached = JSON.parse(raw) as { data: T; fetchedAt: number }
      if (Date.now() - cached.fetchedAt < maxAgeMs) return cached
    }
  } catch {
    /* storage unavailable — fetch normally */
  }

  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
  signal?.addEventListener('abort', () => ctrl.abort())
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { Accept: 'application/json' } })
    if (!res.ok) {
      if (res.status === 403 || res.status === 429) throw new Error('Rate limit reached. Try again in a few minutes.')
      throw new Error(`Request failed (${res.status})`)
    }
    const result = { data: (await res.json()) as T, fetchedAt: Date.now() }
    try {
      sessionStorage.setItem(cacheKey, JSON.stringify(result))
    } catch {
      /* ignore quota / privacy-mode errors */
    }
    return result
  } catch (err) {
    if ((err as Error).name === 'AbortError') throw new Error('The request timed out.', { cause: err })
    throw err
  } finally {
    clearTimeout(timer)
  }
}

/* ───────────────────────── Environment (Open-Meteo) ───────────────────────── */

export interface EnvSnapshot {
  current: {
    time: string
    temperature: number
    apparent: number
    humidity: number
    wind: number
    pressure: number
    cloud: number
    isDay: boolean
    code: number
  }
  air: {
    aqi: number | null
    /** US AQI sub-index per pollutant — drives the colour of each tile. */
    aqiBy: { pm25: number | null; pm10: number | null; co: number | null; no2: number | null }
    pm25: number | null
    pm10: number | null
    co: number | null
    no2: number | null
    co2: number | null
  }
  /** The 24 hours leading up to the current reading, hourly. */
  series: {
    time: string[]
    temperature: (number | null)[]
    humidity: (number | null)[]
    pm25: (number | null)[]
    co2: (number | null)[]
  }
}

interface WeatherResponse {
  current: {
    time: string
    temperature_2m: number
    apparent_temperature: number
    relative_humidity_2m: number
    wind_speed_10m: number
    surface_pressure: number
    cloud_cover: number
    is_day: number
    weather_code: number
  }
  hourly: { time: string[]; temperature_2m: number[]; relative_humidity_2m: number[] }
}

interface AirResponse {
  current: {
    us_aqi?: number
    us_aqi_pm2_5?: number
    us_aqi_pm10?: number
    us_aqi_carbon_monoxide?: number
    us_aqi_nitrogen_dioxide?: number
    pm2_5?: number
    pm10?: number
    carbon_monoxide?: number
    nitrogen_dioxide?: number
    carbon_dioxide?: number
  }
  hourly: { time: string[]; pm2_5?: (number | null)[]; carbon_dioxide?: (number | null)[] }
}

export async function getEnvironment(signal?: AbortSignal, force = false) {
  const { latitude, longitude, timezone, refreshMinutes } = site.live
  const base = `latitude=${latitude}&longitude=${longitude}&timezone=${encodeURIComponent(timezone)}&past_days=1&forecast_days=1`
  const maxAge = force ? 0 : refreshMinutes * 60_000
  const [w, a] = await Promise.all([
    fetchJSON<WeatherResponse>(
      `https://api.open-meteo.com/v1/forecast?${base}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,surface_pressure,cloud_cover,is_day,weather_code&hourly=temperature_2m,relative_humidity_2m`,
      'live:weather',
      maxAge,
      signal,
    ),
    // Air quality is optional — weather alone is still useful if this fails.
    fetchJSON<AirResponse>(
      `https://air-quality-api.open-meteo.com/v1/air-quality?${base}&current=us_aqi,us_aqi_pm2_5,us_aqi_pm10,us_aqi_carbon_monoxide,us_aqi_nitrogen_dioxide,pm2_5,pm10,carbon_monoxide,nitrogen_dioxide,carbon_dioxide&hourly=pm2_5,carbon_dioxide`,
      'live:air-v2',
      maxAge,
      signal,
    ).catch(() => null),
  ])

  const wc = w.data.current
  const hours = w.data.hourly.time
  // Hourly slots are "YYYY-MM-DDTHH:00"; keep the 24 hours up to the current hour.
  const currentHour = wc.time.slice(0, 13)
  let stop = hours.findIndex((t) => t.slice(0, 13) > currentHour)
  if (stop === -1) stop = hours.length
  const start = Math.max(0, stop - 25)
  const times = hours.slice(start, stop)

  const airIndex = new Map((a?.data.hourly.time ?? []).map((t, i) => [t, i]))
  const pickAir = (arr: (number | null)[] | undefined) =>
    times.map((t) => {
      const i = airIndex.get(t)
      return i === undefined || !arr ? null : (arr[i] ?? null)
    })

  const ac = a?.data.current
  const snapshot: EnvSnapshot = {
    current: {
      time: wc.time,
      temperature: wc.temperature_2m,
      apparent: wc.apparent_temperature,
      humidity: wc.relative_humidity_2m,
      wind: wc.wind_speed_10m,
      pressure: wc.surface_pressure,
      cloud: wc.cloud_cover,
      isDay: wc.is_day === 1,
      code: wc.weather_code,
    },
    air: {
      aqi: ac?.us_aqi ?? null,
      aqiBy: {
        pm25: ac?.us_aqi_pm2_5 ?? null,
        pm10: ac?.us_aqi_pm10 ?? null,
        co: ac?.us_aqi_carbon_monoxide ?? null,
        no2: ac?.us_aqi_nitrogen_dioxide ?? null,
      },
      pm25: ac?.pm2_5 ?? null,
      pm10: ac?.pm10 ?? null,
      co: ac?.carbon_monoxide ?? null,
      no2: ac?.nitrogen_dioxide ?? null,
      co2: ac?.carbon_dioxide ?? null,
    },
    series: {
      time: times,
      temperature: w.data.hourly.temperature_2m.slice(start, stop),
      humidity: w.data.hourly.relative_humidity_2m.slice(start, stop),
      pm25: pickAir(a?.data.hourly.pm2_5),
      co2: pickAir(a?.data.hourly.carbon_dioxide),
    },
  }
  return { data: snapshot, fetchedAt: Math.min(w.fetchedAt, a?.fetchedAt ?? w.fetchedAt) }
}

/** WMO weather code → short description. */
export function describeWeather(code: number): string {
  if (code === 0) return 'Clear sky'
  if (code <= 2) return 'Partly cloudy'
  if (code === 3) return 'Overcast'
  if (code <= 48) return 'Fog'
  if (code <= 57) return 'Drizzle'
  if (code <= 67) return 'Rain'
  if (code <= 77) return 'Snow'
  if (code <= 82) return 'Rain showers'
  if (code <= 86) return 'Snow showers'
  return 'Thunderstorm'
}

export type AqiTone = 'good' | 'moderate' | 'warning' | 'serious' | 'critical'

/** US EPA AQI bands. */
export function aqiLevel(aqi: number): { label: string; tone: AqiTone } {
  if (aqi <= 50) return { label: 'Good', tone: 'good' }
  if (aqi <= 100) return { label: 'Moderate', tone: 'moderate' }
  if (aqi <= 150) return { label: 'Unhealthy for sensitive groups', tone: 'warning' }
  if (aqi <= 200) return { label: 'Unhealthy', tone: 'serious' }
  return { label: 'Very unhealthy', tone: 'critical' }
}

/* ───────────────────────────── GitHub ───────────────────────────── */

export interface GhUser {
  login: string
  public_repos: number
  followers: number
  created_at: string
  html_url: string
}

export interface GhRepo {
  id: number
  name: string
  html_url: string
  homepage: string | null
  description: string | null
  language: string | null
  pushed_at: string
  fork: boolean
  stargazers_count: number
}

export interface GhEvent {
  id: string
  type: string
  repo: { name: string }
  created_at: string
  payload: { commits?: { message: string; sha: string }[]; ref_type?: string; ref?: string | null; size?: number }
}

export interface GithubSnapshot {
  user: GhUser
  repos: GhRepo[]
  events: GhEvent[]
}

export async function getGithub(signal?: AbortSignal, force = false) {
  const u = site.live.githubUser
  // GitHub allows 60 unauthenticated requests/hour, so even a forced refresh reuses data under a minute old
  const maxAge = force ? 60_000 : site.live.refreshMinutes * 60_000
  const [user, repos, events] = await Promise.all([
    fetchJSON<GhUser>(`https://api.github.com/users/${u}`, 'live:gh-user', maxAge, signal),
    fetchJSON<GhRepo[]>(`https://api.github.com/users/${u}/repos?per_page=100&sort=pushed`, 'live:gh-repos', maxAge, signal),
    fetchJSON<GhEvent[]>(`https://api.github.com/users/${u}/events/public?per_page=30`, 'live:gh-events', maxAge, signal).catch(
      () => ({ data: [] as GhEvent[], fetchedAt: Date.now() }),
    ),
  ])
  const hidden = new Set<string>(site.live.githubHiddenRepos)
  const data: GithubSnapshot = {
    user: user.data,
    repos: repos.data.filter((r) => !r.fork && !hidden.has(r.name)),
    events: events.data,
  }
  return { data, fetchedAt: Math.min(user.fetchedAt, repos.fetchedAt) }
}

/* ───────────────────────────── formatting ───────────────────────────── */

export function timeAgo(from: string | number, now = Date.now()): string {
  const t = typeof from === 'number' ? from : Date.parse(from)
  const s = Math.max(0, Math.round((now - t) / 1000))
  if (s < 10) return 'just now'
  if (s < 60) return `${s}s ago`
  const m = Math.round(s / 60)
  if (m < 60) return `${m} min ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h} h ago`
  const d = Math.round(h / 24)
  if (d < 31) return `${d} day${d === 1 ? '' : 's'} ago`
  const mo = Math.round(d / 30.4)
  if (mo < 12) return `${mo} month${mo === 1 ? '' : 's'} ago`
  const y = Math.round(mo / 12)
  return `${y} year${y === 1 ? '' : 's'} ago`
}
