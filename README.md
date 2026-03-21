# Agency CRM Web Platform

A lightweight Next.js + Prisma control center for tracking clients, projects, and tasks in one place. It ships with a SQLite database, Prisma schema, seed script, and server actions for CRUD flows so you can run the dashboard locally or push it to your own infrastructure.

## Stack

- **Next.js 14 / App Router**
- **Prisma + SQLite** (easily switch to Postgres by updating `DATABASE_URL`)
- **TailwindCSS** for the UI
- **Server Actions** for create/update flows

## Getting Started

```bash
cd agency-os
npm install
npm run db:push     # creates prisma/dev.db
npm run db:seed     # loads the sample data
npm run dev         # http://localhost:3000
```

> **Environment:** `DATABASE_URL` must be available anywhere Prisma runs (local + CI). The dev config points to `file:./prisma/dev.db`, but set a real connection string in your hosting provider’s env vars before deploying.

Credentials live in `.env` (currently pointing to `file:./prisma/dev.db`). Change it to your Postgres connection string when you’re ready; Prisma migration scripts are already wired (`npm run db:migrate`).

## Features

- **Client table** with tiering, retainer totals, and add-client form
- **Project pipeline** grouped by status with inline create form
- **Task kanban** with owner, notes, and status updates
- **Metrics row** (retainer, clients, active projects, tasks)

Everything in the UI writes through Prisma server actions, so the DB stays the source of truth.

## Deploying

1. Build the project: `npm run build`
2. Deploy to Vercel / Netlify / Render (any Node 18+ host). The repo now runs `prisma generate` automatically (via `postinstall` + `build`), but always trigger a "clear cache & deploy" on Netlify the first time so stale node_modules don’t break Prisma.
3. For production, swap `DATABASE_URL` to your managed Postgres instance and run `npm run db:migrate` before `npm run start`.

## Project Structure

```
app/           # Next App Router pages
components/   # UI components (clients, projects, tasks)
lib/prisma.ts # Prisma singleton
lib/actions.ts# Server actions for CRUD
prisma/       # schema + seed + migrations
```

Let me know if you want additional modules (e.g., meeting notes, billing, Slack alerts) and I’ll extend it.
