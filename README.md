# TestMyPrompt

TestMyPrompt is a micro-SaaS for vulnerability testing AI prompts.

It includes:
- Marketing site (home, features, pricing, docs, contact)
- Authentication (NextAuth credentials)
- Multi-tenant workspaces with roles (owner/admin/member)
- Prompt vulnerability scoring engine with findings and remediation guidance
- Test history by workspace
- Plan-based monthly usage limits
- Stripe checkout + customer portal + webhook synchronization

## Tech Stack

- Next.js 16 (App Router, TypeScript)
- Prisma + PostgreSQL
- NextAuth + Prisma adapter
- Stripe billing APIs
- Tailwind CSS
- Zod validation
- Vitest unit tests

## Project Structure

- `app/`: Marketing pages, dashboard pages, API routes
- `components/`: UI components and forms
- `lib/`: Auth, DB client, scoring engine, billing helpers, validators
- `prisma/`: Schema and seed script
- `tests/`: Unit tests

## Quick Start

1. Install dependencies

```bash
npm install
```

2. Copy env file

```bash
cp .env.example .env
```

3. Set required env vars in `.env`

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `NEXT_PUBLIC_APP_URL`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_PRO`
- `STRIPE_PRICE_BUSINESS`

4. Generate Prisma client and run migrations

```bash
npm run db:generate
npm run db:migrate
```

5. Seed demo data

```bash
npm run db:seed
```

Seed user:
- Email: `demo@testmyprompt.dev`
- Password: `Password123!`

6. Run development server

```bash
npm run dev
```

Open http://localhost:3000.

## Billing Setup Notes

- Create Stripe products and recurring prices for Pro and Business.
- Put the Stripe price IDs into `STRIPE_PRICE_PRO` and `STRIPE_PRICE_BUSINESS`.
- Configure webhook endpoint:
	- URL: `http://localhost:3000/api/stripe/webhook`
	- Events:
		- `checkout.session.completed`
		- `customer.subscription.updated`
		- `customer.subscription.deleted`

## Prompt Scoring Engine

Scoring is heuristic-based and returns:
- `score` (0-100)
- `summary`
- structured `findings[]`

Current checks include:
- Prompt injection override language
- Data exfiltration cues
- Policy bypass intent
- Indirect external instruction risk
- Over-broad tooling requests

## Workspace + Roles

Workspace access roles:
- `OWNER`
- `ADMIN`
- `MEMBER`

Capabilities included:
- Create workspace
- Add members by email
- Run vulnerability tests scoped to workspace
- View workspace-specific usage and history

## Plans and Usage Limits

- Trial: 2 tests/month, 2 seats
- Pro: 20 tests/month, 10 seats
- Business: 200 tests/month, 25 seats (customizable higher limits)

When a workspace exceeds its monthly test limit, the test API returns a quota error.

## Useful Commands

```bash
npm run dev
npm run lint
npm run test
npm run build
npm run db:generate
npm run db:migrate
npm run db:seed
```

## Production Considerations

Before production:
- Add email verification and password reset flows
- Add invitation tokens (instead of email-only membership add)
- Add audit logs for role changes and billing updates
- Add rate limiting and abuse prevention at API edge
- Expand scoring with model-in-the-loop adjudication
- Add observability and structured logging
