import { site } from '../config/site'
import { fetchJSON } from './live'

/** Where the live panels read from — the visitor's city, or the configured home city as a fallback. */
export interface Place {
  city: string
  country: string
  latitude: number
  longitude: number
  timezone: string
  /** False when the IP lookup failed and we fell back to `site.live`. */
  detected: boolean
}

export const homePlace: Place = {
  city: site.live.place,
  country: 'India',
  latitude: site.live.latitude,
  longitude: site.live.longitude,
  timezone: site.live.timezone,
  detected: false,
}

const SIX_HOURS = 6 * 60 * 60_000
const browserZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone || site.live.timezone

interface IpWhoIs {
  success: boolean
  city: string
  country: string
  latitude: number
  longitude: number
  timezone?: { id: string }
}

interface GeoJs {
  city?: string
  country?: string
  latitude: string
  longitude: string
  timezone?: string
}

/** City-level location from the visitor's IP (no permission prompt). Two providers, then the home city. */
export async function locateVisitor(signal?: AbortSignal): Promise<Place> {
  try {
    const { data: d } = await fetchJSON<IpWhoIs>('https://ipwho.is/', 'live:visitor-ipwho', SIX_HOURS, signal)
    if (d.success && Number.isFinite(d.latitude) && Number.isFinite(d.longitude)) {
      return {
        city: d.city || d.country,
        country: d.country,
        latitude: d.latitude,
        longitude: d.longitude,
        timezone: d.timezone?.id || browserZone(),
        detected: true,
      }
    }
  } catch {
    /* try the next provider */
  }
  try {
    const { data: d } = await fetchJSON<GeoJs>('https://get.geojs.io/v1/ip/geo.json', 'live:visitor-geojs', SIX_HOURS, signal)
    const lat = Number(d.latitude)
    const lon = Number(d.longitude)
    if (Number.isFinite(lat) && Number.isFinite(lon)) {
      return {
        city: d.city || d.country || 'Your location',
        country: d.country ?? '',
        latitude: lat,
        longitude: lon,
        timezone: d.timezone || browserZone(),
        detected: true,
      }
    }
  } catch {
    /* fall through */
  }
  return homePlace
}

/** "22.80°N 86.20°E" */
export const formatCoords = (p: Place) =>
  `${Math.abs(p.latitude).toFixed(2)}°${p.latitude >= 0 ? 'N' : 'S'} ${Math.abs(p.longitude).toFixed(2)}°${p.longitude >= 0 ? 'E' : 'W'}`
