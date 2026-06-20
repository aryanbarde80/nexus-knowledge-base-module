# Nexus ERP Knowledge Base Module

Production-ready internal Knowledge Base / Wiki module for Nexus ERP. It ships as a Vue 3 + TypeScript frontend with a NestJS serverless API for Vercel, Postgres as the primary datastore, and Firebase Admin hooks for realtime notifications/activity mirroring.

## Features

- Dashboard with article/category/tag/draft totals, health score, activity, popular docs, active authors, and charts.
- Article management with draft/publish/archive, duplicate, favorites, rich metadata, and version history.
- TipTap editor with headings, lists, checklists, tables, code blocks, images, videos, quotes, links, and shortcuts.
- Category tree with nested HR, SOP, onboarding, IT, training, engineering, finance, and support defaults.
- Instant search, recent searches, suggestions, AI assistant panel, templates, upload center UI, notifications, RBAC settings, light/dark mode.
- Vercel-ready `api/index.ts` NestJS handler and SPA rewrites.

## Local Development

```bash
npm install
npm run dev
```

The frontend uses local seed data immediately. Set env vars to activate Postgres/Firebase integrations.

## Vercel Environment

Copy `.env.example` into Vercel project settings:

- `DATABASE_URL`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `JWT_SECRET`
- `VITE_API_BASE=/api`
- `VITE_NEXUS_IFRAME_ORIGIN=https://nexus-erp-software.lovable.app`

## Database

Run `server/schema.sql` on your Postgres database. Tables included:

`users`, `categories`, `articles`, `article_versions`, `tags`, `article_tags`, `favorites`, `attachments`, `notifications`, `article_views`, `search_history`.

## API

- `GET /api/articles`
- `GET /api/articles/:id`
- `POST /api/articles`
- `PUT /api/articles/:id`
- `DELETE /api/articles/:id`
- `GET /api/categories`
- `POST /api/categories`
- `GET /api/search?q=...`
- `POST /api/favorites`
- `GET /api/activity`
- `GET /api/versions`
- `POST /api/restore-version`

Nexus ERP can pass authenticated user context via headers: `x-user-id`, `x-user-role`, and `x-user-email`.
