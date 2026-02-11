# Music Blog

A Next.js + PostgreSQL music blog with:
- Public blog homepage ordered newest-first.
- Individual post pages with embedded Spotify playlists.
- Protected admin CMS with WYSIWYG editor.

## Stack
- Next.js (App Router, TypeScript)
- Prisma + PostgreSQL
- Custom JWT cookie auth (single admin)
- Tiptap editor

## Setup
1. Install deps:
   ```bash
   npm install
   ```
2. Copy env template:
   ```bash
   cp .env.example .env
   ```
3. Update `.env` values:
- `DATABASE_URL`
- `AUTH_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

4. Run migrations and seed admin user:
   ```bash
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   ```

5. Start dev server:
   ```bash
   npm run dev
   ```

## Key routes
- `/` public blog index
- `/posts/[slug]` public post page with Spotify embed
- `/admin/login` admin sign-in
- `/admin/posts` CMS post list
- `/admin/posts/new` create post
- `/admin/posts/[id]` edit post

## Deployment
- Create Postgres database (Neon, Supabase, Railway, etc)
- Configure env vars on host
- Run Prisma migrations during deploy

See hosting options in `docs/hosting.md`.
See the project color palette in `docs/style-guide.md`.
