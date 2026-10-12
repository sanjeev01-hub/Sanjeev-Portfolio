/**
 * Project + case-study content.
 *
 * Writing rule for this file: describe what was built, never invent numbers.
 * Lines tagged `VERIFY` come from the project brief rather than the resume —
 * read them and adjust wording so it matches the real implementation.
 * Links are `null` until a real URL exists; null links are not rendered.
 */

export type MockupKind = 'mandi' | 'iot' | 'mobile'

export interface Project {
  slug: string
  number: string
  name: string
  category: string
  year: string
  role: string
  summary: string
  stack: string[]
  highlights: string[]
  mockup: MockupKind
  links: { github: string | null; live: string | null }
  caseStudy: {
    problem: string
    users: string[]
    contribution: string[]
    approach: { title: string; body: string }[]
    decisions: string[]
    challenges: string[]
    outcome: string
  }
}

export const projects: Project[] = [
  {
    slug: 'digital-fish-mandi',
    number: '01',
    name: 'Digital Fish Mandi',
    category: 'Mobile application · Marketplace operations',
    year: '2025 — Present',
    role: 'Mobile & API developer',
    summary:
      'Designing digital workflows for fish-market operations, from supplier arrivals and auction transactions to commission calculations and settlement tracking.',
    stack: ['React Native', 'Python', 'REST APIs', 'MySQL', 'Postman'],
    highlights: ['Role-based workflows', 'Auction transactions', 'Commission & settlements', 'Inventory tracking'],
    mockup: 'mandi',
    links: { github: null, live: null },
    caseStudy: {
      problem:
        'A wholesale fish market runs on fast, verbal, paper-heavy transactions. Arrivals, bids, commissions and settlements are tracked by hand, which makes it difficult to see what has been sold, what is owed and to whom, especially at the end of a busy trading day.',
      users: [
        'Suppliers bringing fish into the market',
        'Commission agents who run the sale and earn a percentage',
        'Buyers and vendors purchasing lots',
        'Market staff reconciling the day’s transactions',
      ],
      contribution: [
        'Built the React Native mobile application screens and navigation for the core market workflows.',
        'Implemented modules for vendor management, product listing and order processing.',
        'Developed and integrated RESTful endpoints with the Python backend.',
        'Tested APIs with Postman and carried out manual and basic automated testing to keep releases stable.',
      ],
      approach: [
        {
          title: 'Model the market, not the screen',
          body: 'The data model follows the real sequence of a trading day — an arrival is recorded, lots are put up, transactions are captured, then commission and settlement are derived from those transactions.',
        },
        {
          title: 'Roles define what each person sees',
          body: 'Suppliers, agents and buyers need different views of the same transaction, so access and navigation are organised around the role of the signed-in user.', // VERIFY
        },
        {
          title: 'A thin client over a clear API',
          body: 'The mobile app focuses on fast data entry and readable summaries; business rules live behind REST endpoints so they stay consistent across devices.',
        },
      ],
      decisions: [
        'Commission and settlement amounts are derived from recorded transactions rather than typed in separately, so totals can always be traced back to their source.', // VERIFY
        'Every endpoint was exercised in Postman before being wired into the app, which made it easier to separate API issues from UI issues.',
        'Forms are designed for quick entry in a noisy, time-pressured environment: large tap targets, few fields per step and sensible defaults.',
      ],
      challenges: [
        'Translating informal, verbal market practices into explicit states and rules without making the workflow slower than paper.',
        'Keeping money calculations consistent between what the app displays and what the backend stores.',
        'Balancing feature scope against the need for a dependable first release.',
      ],
      outcome:
        'A working mobile application covering vendor management, product listing and order processing, backed by tested REST APIs — the foundation for a fully digital record of market transactions.',
    },
  },
  {
    slug: 'iot-sensor-dashboard',
    number: '02',
    name: 'IoT Sensor Monitoring Dashboard',
    category: 'Data visualisation · IoT',
    year: '2025',
    role: 'IoT-Sensor Visualization Intern — RailTel Corporation of India',
    summary:
      'An interactive monitoring dashboard that brings environmental sensor data, historical trends, and device information into one clear interface.',
    stack: ['Python', 'Streamlit', 'MQTT', 'InfluxDB', 'OpenWeather API'],
    highlights: ['Real-time MQTT ingestion', 'Time-series storage', 'Weather integration', 'Secure login & alerts'],
    mockup: 'iot',
    links: { github: 'https://github.com/sanjeev01-hub/IOT-SENSOR-VISUALIZATION', live: null },
    caseStudy: {
      problem:
        'Environmental sensors produce a constant stream of readings, but raw MQTT messages are not something an operator can act on. The data needed to be stored, visualised over time and turned into alerts when values crossed limits.',
      users: [
        'Operators monitoring sensor sites',
        'Engineers checking device health and historical trends',
      ],
      contribution: [
        'Developed a real-time dashboard in Streamlit to visualise IoT sensor data received over MQTT.',
        'Integrated InfluxDB for time-series storage of incoming readings.',
        'Added OpenWeather API data so on-site readings could be compared with local weather conditions.',
        'Implemented secure login and an automated alert system.',
      ],
      approach: [
        {
          title: 'Ingest → store → visualise',
          body: 'Devices publish readings to an MQTT broker; a Python subscriber writes them into InfluxDB, and the dashboard queries InfluxDB for both live values and historical ranges.',
        },
        {
          title: 'Sensors as configuration',
          body: 'Temperature, humidity, CO₂ and other gas sensors are handled through the same pipeline, so adding a sensor does not mean rewriting the dashboard.', // VERIFY
        },
        {
          title: 'Context beside the data',
          body: 'Outdoor weather from the OpenWeather API sits next to sensor readings, making it easier to tell an environmental change from a device fault.',
        },
      ],
      decisions: [
        'InfluxDB over a relational database, because the workload is append-heavy, timestamped data queried by time range.',
        'Streamlit for the interface, which kept the whole stack in Python and made iteration on charts fast.',
        'MQTT for transport — lightweight, publish/subscribe and well suited to constrained devices. Device control commands use the same channel.', // VERIFY
      ],
      challenges: [
        'Keeping charts responsive as the volume of stored readings grows — handled by querying aggregated windows instead of raw points.', // VERIFY
        'Choosing alert thresholds that are useful without being noisy.',
        'Handling gaps when a device goes offline so missing data is visible rather than silently interpolated.',
      ],
      outcome:
        'A working dashboard that receives sensor data over MQTT, stores it in InfluxDB, visualises live and historical trends alongside weather data, and is protected by login with automated alerts.',
    },
  },
  {
    slug: 'react-native-apps',
    number: '03',
    name: 'React Native Application Development',
    category: 'Mobile engineering',
    year: '2025 — Present',
    role: 'Mobile developer',
    summary:
      'Building mobile experiences with a focus on practical workflows, reliable API communication, and maintainable application architecture.',
    stack: ['React Native', 'Expo', 'JavaScript', 'REST APIs', 'SQLite'],
    highlights: ['Expo workflow', 'API integration', 'Offline-first data', 'Reusable components'],
    mockup: 'mobile',
    links: { github: null, live: null },
    caseStudy: {
      problem:
        'Business apps are used on the move, on patchy networks, by people who need to finish a task quickly. A mobile app that only works with a perfect connection, or that is hard to change after the first release, does not survive real use.',
      users: ['Field and operations staff using apps during daily work', 'Teams who maintain and extend the app after release'],
      contribution: [
        'Built screens, navigation and shared UI components in React Native with Expo.',
        'Integrated REST APIs, including request handling, loading states and error feedback.',
        'Worked on offline-first flows where data is saved locally and synchronised when a connection is available.',
        'Tested features manually and with basic automation before release.',
      ],
      approach: [
        {
          title: 'Local first, then sync',
          body: 'Where the workflow needs it, data is written to on-device storage first so the user is never blocked, then synchronised with the API in the background.',
        },
        {
          title: 'One API layer',
          body: 'Network calls go through a single service layer that handles base URLs, headers and errors, keeping screens focused on presentation.',
        },
        {
          title: 'Components that repeat',
          body: 'Inputs, list rows and status indicators are shared components so the app stays consistent as it grows.',
        },
      ],
      decisions: [
        'Expo for faster builds and simpler device testing during development.',
        'Explicit loading, empty and error states on every data-driven screen.',
        'Keeping business rules on the server, so the app and backend cannot drift apart.',
      ],
      challenges: [
        'Resolving conflicts when the same record changes offline and online.',
        'Keeping the interface quick on lower-end Android devices.',
        'Designing forms that work with one hand and minimal typing.',
      ],
      outcome:
        'Mobile applications with working API integration and offline-aware data flows, built on a component structure that is straightforward to extend.',
    },
  },
]

/** Smaller pieces of work listed under the featured projects. */
export const otherWork = [
  {
    name: 'Calibration Due-Date Monitoring System',
    context: 'Tata Steel · Internship · 2024',
    description: 'Automated email alerts (SMTP) for upcoming calibration dates, with a secure dashboard tracking calibration history and schedules.',
    stack: ['Python', 'Streamlit', 'SMTP'],
    github: 'https://github.com/sanjeev01-hub/Calibration-Due-Date-',
    live: 'https://calibration.streamlit.app/',
  },
  {
    name: 'IoT-Based Weather Station',
    context: 'Personal project',
    description: 'Arduino sensors publishing over MQTT (HiveMQ) into InfluxDB, with a React.js dashboard and Raspberry Pi for remote monitoring.',
    stack: ['Arduino', 'MQTT', 'InfluxDB', 'React.js', 'Raspberry Pi'],
    github: null,
    live: null,
  },
  {
    name: 'ALLign & Mewar Marble websites',
    context: 'Micronix System · Client work',
    description: 'Designed and built complete responsive websites, including UI/UX improvements, performance work and client-requested enhancements.',
    stack: ['HTML', 'CSS', 'JavaScript'],
    github: null,
    live: null,
  },
] as const
