/**
 * Experience, education, skills and principles.
 * All entries below are taken from the resume — edit freely.
 */

export interface TimelineEntry {
  period: string
  title: string
  org: string
  place: string
  kind: 'work' | 'internship' | 'education'
  points: string[]
  current?: boolean
}

export const experience: TimelineEntry[] = [
  {
    period: 'Nov 2025 — Present',
    title: 'Software Developer', // EDIT: use your exact job title if it differs
    org: 'Micronix System Pvt Ltd',
    place: 'Kolkata',
    kind: 'work',
    current: true,
    points: [
      'Developing a fish-market management mobile app with React Native and a Python backend — vendor management, product listing and order processing.',
      'Building and integrating RESTful APIs; validating and debugging them with Postman.',
      'Manual and basic automation testing for application stability.',
      'Designed and built complete client websites including ALLign and Mewar Marble.',
    ],
  },
  {
    period: 'Aug 2025 — Nov 2025',
    title: 'IoT Development', // EDIT: add your job title — not stated on the resume
    org: 'Pcs Global Pvt Ltd',
    place: 'Kolkata',
    kind: 'work',
    points: [
      'Contributed to an IoT weather station using Arduino and environmental sensors.',
      'Implemented MQTT communication for sending sensor data to the server.',
      'Assisted with dashboard integration and testing of real-time visualisation modules.',
    ],
  },
  {
    period: 'Feb 2025 — Jun 2025',
    title: 'IoT-Sensor Visualization Intern',
    org: 'RailTel Corporation of India Ltd',
    place: 'Pune',
    kind: 'internship',
    points: [
      'Built a real-time Streamlit dashboard for IoT sensor data received over MQTT.',
      'Integrated InfluxDB for time-series storage and the OpenWeather API; added secure login and automated alerts.',
    ],
  },
  {
    period: 'May 2024 — Jul 2024',
    title: 'Calibration Monitoring System Intern',
    org: 'Tata Steel Ltd',
    place: 'Jamshedpur',
    kind: 'internship',
    points: [
      'Built a system that emails calibration due-date alerts over SMTP.',
      'Designed a secure dashboard with a central database for calibration history and schedules.',
    ],
  },
]

export const education: TimelineEntry[] = [
  {
    period: '2023 — 2025',
    title: 'Master of Computer Applications (MCA)',
    org: 'Birla Institute of Technology, Mesra',
    place: 'CGPA 7.78 / 10',
    kind: 'education',
    points: [],
  },
  {
    period: '2020 — 2023',
    title: 'Bachelor of Computer Applications (BCA)',
    org: 'Birla Institute of Technology, Mesra',
    place: 'CGPA 9.07 / 10',
    kind: 'education',
    points: [],
  },
  {
    period: '2015 — 2018',
    title: 'Diploma in Mechanical Engineering',
    org: 'Sant Longowal Institute of Engineering & Technology',
    place: 'Punjab',
    kind: 'education',
    points: [],
  },
]

export const certifications = [
  'Google IT Automation with Python',
  'JPMorgan Chase & Co. — Software Engineering Virtual Experience',
]

export interface Certificate {
  id: string
  /** What the certificate is for. */
  title: string
  issuer: string
  /** Shown as a small label on the card. */
  kind: 'Recognition' | 'Internship' | 'Training'
  period: string
  /** One line on what it covers. */
  detail: string
  /** Files in public/certificates: `<id>.webp` (full) and `<id>-thumb.webp`. */
  width: number
  height: number
  thumbWidth: number
  thumbHeight: number
}

/** Scanned certificates, newest first. Images live in public/certificates. */
export const certificates: Certificate[] = [
  {
    id: 'micronix-appreciation',
    title: 'Certificate of Appreciation',
    issuer: 'Micronix Systems Pvt. Ltd.',
    kind: 'Recognition',
    period: 'Aug 2026',
    detail: 'For exceptional performance and contributions as a Software Developer.',
    width: 1536,
    height: 1024,
    thumbWidth: 760,
    thumbHeight: 507,
  },
  {
    id: 'railtel-internship',
    title: 'IoT Sensor Visualization Internship',
    issuer: 'RailTel Corporation of India Ltd.',
    kind: 'Internship',
    period: 'Jan — Jun 2025',
    detail: 'Internship at the GM/CNOC office, Shastri Park, Delhi.',
    width: 1541,
    height: 1020,
    thumbWidth: 760,
    thumbHeight: 503,
  },
  {
    id: 'tata-steel-training',
    title: 'Vocational Training — Prashikshan 2024',
    issuer: 'Tata Steel Ltd. · Shavak Nanavati Technical Institute',
    kind: 'Training',
    period: 'May — Jul 2024',
    detail: 'IT Services · Project: Calibration Due-Date Monitoring System.',
    width: 1080,
    height: 1027,
    thumbWidth: 760,
    thumbHeight: 723,
  },
]

export interface SkillGroup {
  id: string
  title: string
  note: string
  items: { name: string; usedIn?: string }[]
}

export const skillGroups: SkillGroup[] = [
  {
    id: 'frontend',
    title: 'Frontend',
    note: 'Interfaces for web and mobile',
    items: [
      { name: 'React.js', usedIn: 'IoT weather-station dashboard' },
      { name: 'React Native', usedIn: 'Fish-market mobile app' },
      { name: 'JavaScript' },
      { name: 'HTML5', usedIn: 'Client websites' },
      { name: 'CSS3', usedIn: 'Client websites' },
    ],
  },
  {
    id: 'backend',
    title: 'Backend',
    note: 'APIs and application logic',
    items: [
      { name: 'Python', usedIn: 'Backends, dashboards, automation' },
      { name: 'Flask' },
      { name: 'FastAPI' },
      { name: 'REST APIs', usedIn: 'Designed, integrated, tested' },
    ],
  },
  {
    id: 'data',
    title: 'Data & Storage',
    note: 'Relational, local and time-series',
    items: [
      { name: 'MySQL' },
      { name: 'SQLite', usedIn: 'On-device storage' },
      { name: 'InfluxDB', usedIn: 'Sensor time-series' },
    ],
  },
  {
    id: 'tools',
    title: 'Tools & Integration',
    note: 'How work gets shipped',
    items: [
      { name: 'Git' },
      { name: 'GitHub' },
      { name: 'Docker' },
      { name: 'Postman', usedIn: 'API validation & debugging' },
      { name: 'MQTT', usedIn: 'Sensor data transport' },
    ],
  },
  {
    id: 'more',
    title: 'Additional Areas',
    note: 'Where the work tends to lead',
    items: [
      { name: 'Streamlit', usedIn: 'Monitoring dashboards' },
      { name: 'IoT dashboards' },
      { name: 'API integration' },
      { name: 'Offline-first workflows' },
    ],
  },
]

export const principles = [
  {
    title: 'Understand the problem before choosing the technology.',
    body: 'The right stack is the one that fits the people, the data and the constraints. That only becomes clear after the workflow is understood.',
  },
  {
    title: 'Build for maintainability, not just the first release.',
    body: 'Clear structure, shared components and a single place for business rules make the second and third release easier than the first.',
  },
  {
    title: 'Treat usability and reliability as part of engineering.',
    body: 'Loading states, error messages, offline behaviour and readable interfaces are part of the feature, not polish added at the end.',
  },
]
