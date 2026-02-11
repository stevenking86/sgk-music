# Hosting Recommendations

These are the recommended hosting options for this Next.js + Postgres project.

## 1) Vercel + Neon (Recommended)
- Why: Best developer experience for Next.js deployments and preview environments.
- Pairing: Use Neon for managed Postgres.
- Links:
  - [Vercel Pricing](https://vercel.com/pricing)
  - [Neon Pricing](https://neon.com/pricing)

## 2) Vercel + Supabase
- Why: Good if you want Postgres plus additional platform features over time.
- Links:
  - [Supabase Billing](https://supabase.com/docs/guides/platform/billing-on-supabase)

## 3) Railway
- Why: Simpler all-in-one deploy option for app + Postgres.
- Link:
  - [Railway Pricing](https://railway.com/pricing)

## Notes
- For this codebase, Vercel + Neon is the default recommendation.
- Set these environment variables in your host before first deploy:
  - `DATABASE_URL`
  - `AUTH_SECRET`
  - `ADMIN_EMAIL`
  - `ADMIN_PASSWORD`
