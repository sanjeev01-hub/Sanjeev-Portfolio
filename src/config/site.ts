/**
 * ─────────────────────────────────────────────────────────────
 *  SITE CONFIGURATION — edit this file to update personal details.
 *  Anything set to `null` is hidden automatically in the UI.
 * ─────────────────────────────────────────────────────────────
 */

export const site = {
  name: 'Sanjeev Kumar Sharma',
  shortName: 'Sanjeev Sharma',
  role: 'Software Developer',
  location: 'Jamshedpur, Jharkhand, India',
  url: 'https://sanjeev01-hub.github.io/',

  /** Shown in the nav. Set `enabled: false` the moment it stops being accurate. */
  availability: {
    enabled: true,
    label: 'Open to opportunities',
  },

  contact: {
    email: 'sanjeev408sharma@gmail.com',
    /** Optional — set to a string like '+91-XXXXXXXXXX' to show a call link. */
    phone: null as string | null,
    github: 'https://github.com/sanjeev01-hub',
    linkedin: 'https://www.linkedin.com/in/sanjeev-kumar-sharma-82b1731b7/',
    /** Path inside /public. Set to null to hide the resume button. */
    resume: 'resume/Sanjeev-Kumar-Sharma-Resume.pdf' as string | null,
  },

  /** Used by the live sections (GitHub feed + environment readings). */
  live: {
    githubUser: 'sanjeev01-hub',
    /** Repos to leave out of the live repo list (e.g. profile README repos). */
    githubHiddenRepos: ['sanjeev01-hub'],
    place: 'Jamshedpur',
    latitude: 22.8046,
    longitude: 86.2029,
    timezone: 'Asia/Kolkata',
    /** How often the live panels refresh, in minutes. */
    refreshMinutes: 10,
  },
} as const

export const nav = [
  { id: 'work', label: 'Work' },
  { id: 'live', label: 'Live' },
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'contact', label: 'Contact' },
] as const
