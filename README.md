# Lawrence Norton Technical Hiring Brief

A pop-art technical hiring brief built with React, TypeScript, and Vite.

Live site:

https://lnorton89-hiring-brief.netlify.app

Source:

https://github.com/lnorton89/lnorton89

## What It Does

- Presents a hiring-facing technical narrative.
- Pulls selected public GitHub repo evidence at runtime.
- Shows live repo metadata, latest commits, language mix, and GitHub pulse stats.
- Keeps static narrative copy as fallback when GitHub API requests fail or rate-limit.

## Local Development

```powershell
npm install
npm run dev
```

## Verification

```powershell
npm run lint
npm run build
```

## Deployment

The app is deployed on Netlify. Pushes to `main` trigger a Netlify build through a GitHub repository webhook and Netlify build hook.
