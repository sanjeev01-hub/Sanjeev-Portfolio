# Sanjeev Sharma — Portfolio

Personal portfolio built with React, Vite, TypeScript and Motion. Includes a **Live Lab** section that shows real data, refreshed every 10 minutes:

- Environmental readings for Jamshedpur (temperature, humidity, wind, pressure, AQI, PM2.5, PM10, CO, NO₂, CO₂) from the free [Open-Meteo](https://open-meteo.com) APIs. No API key is needed.
- Public GitHub activity (repos, recent pushes) from the GitHub REST API.

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
npm run lint
npm run build      # production build → dist/
npm run preview    # serve dist/ at http://localhost:4173
```

## Edit your content

| What | Where |
| --- | --- |
| Name, email, links, résumé, availability badge, live-data location | `src/config/site.ts` |
| Projects and case studies | `src/content/projects.ts` |
| Experience, education, skills, principles | `src/content/profile.ts` |
| Résumé PDF | `public/resume/Sanjeev-Kumar-Sharma-Resume.pdf` |
| Portrait | `public/portrait.webp` + `public/portrait-fallback.jpg` |

Anything set to `null` (phone, project GitHub/live links) is hidden automatically.

### Please review

- Lines in `src/content/projects.ts` marked `// VERIFY` come from the project brief, not the résumé. Make sure they match what you actually built.
- Job titles in `src/content/profile.ts` marked `// EDIT`. The résumé doesn't state a title for Pcs Global.
- `availability.enabled` in `site.ts`. Turn it off when you're no longer looking.
- The project visuals are original illustrative mockups, labelled as such. You can replace one with a real screenshot in `src/components/mockups/Mockups.tsx`.

## Deploy

**GitHub Pages:** `.github/workflows/deploy.yml` lints, builds and deploys on every push to `main`. In the repo, go to *Settings → Pages → Source* and choose **GitHub Actions**.
The canonical/OG URLs assume the site is served at `https://sanjeev01-hub.github.io/`. Update `index.html`, `public/robots.txt` and `public/sitemap.xml` if you deploy somewhere else.

**Netlify / Vercel:** build command `npm run build`, output directory `dist`.

The previous single-file site is kept in `legacy/` for reference.
