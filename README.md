# AI Cockpit — Engineering Roadmap Dashboard

Personal AI Engineering career transition tracker. 275-day roadmap from April 2026 to January 2027.

## Features

- **Dashboard** — Day counter, momentum score, current phase overview
- **Bootcamp** — 6-day intensive crash course with hour-by-hour schedule
- **Roadmap** — 5-phase timeline from fundamentals to job search
- **Skills Tracker** — 39 skills across 6 categories with dynamic add/remove
- **Daily Journal** — Learning log with momentum scoring (feedback loop)
- **Visibility Tracker** — Build in Public metrics (GitHub, Twitter, LinkedIn, Substack)
- **Resources** — 25 curated learning resources organized by phase

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Express (dev) / Vercel Serverless Functions (prod)
- **Database**: Neon PostgreSQL (serverless)
- **ORM**: Drizzle ORM

## Setup

```bash
npm install
```

Create `.env` with your Neon database URL:
```
DATABASE_URL=postgresql://user:password@host/neondb?sslmode=require
```

Push schema to database:
```bash
npx drizzle-kit push
```

Seed the database:
```bash
npm run db:seed
```

Run locally:
```bash
npm run dev
```

## Deployment

Deployed on Vercel with Neon PostgreSQL. Push to `main` triggers auto-deploy.
