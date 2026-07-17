# JeevanDwaar

**One trusted platform connecting local workers and service providers to fair-paying jobs, farmers to direct buyers, and learners to affordable or donated books—all powered by GPT-5.6.**

JeevanDwaar is a mobile-first, multilingual livelihood platform being built for [OpenAI Build Week](https://openai.devpost.com/). It brings three direct community marketplaces into one coherent experience:

- **Local work and services:** workers discover clearly described, fair-paying opportunities and employers find available local talent.
- **Farmer direct market:** farmers list produce, compare transparent buyer bids and choose the most suitable offer.
- **Books for all:** people sell useful second-hand books or donate them directly to learners.

## Current status

The codebase and submission package are complete:

- Supabase-ready email sign-up/sign-in and auth callback
- No-credential interactive demo access
- Persistent multi-capability profile onboarding
- Live dashboard metrics, notifications, verified reviews and trust
- Complete local-work journey: post → apply → select → start → complete
- Deterministic, transparent skill-match scoring
- Complete produce journey: list → bid → compare → accept → confirm pickup
- Transparent bid totals, benchmark differences and pickup terms
- Clearly dated and labeled demonstration price benchmarks
- Complete books journey: list → search → request → select → handover
- Used-book sale and free-donation modes
- Activity-earned ratings, completion counts and fulfilled-donor signals
- GPT-5.6-assisted work, produce and book listing creation
- Explainable job matching that preserves human hiring decisions
- Produce-offer explanations using deterministic totals and supplied context
- English and Telugu AI assistance plus bilingual primary navigation
- Zod-validated structured AI output, rate limiting and safe fallbacks
- Authenticated Supabase persistence for all three marketplaces
- Guarded lifecycle RPCs, participant RLS and protected trust counters
- Dual-party confirmation for produce pickup and book handover
- Vitest unit tests, Playwright journeys and GitHub Actions CI
- Accessibility, security headers, loading/error states and social metadata
- Deployment guide, demo script and complete Devpost submission draft
- Browser-persisted demo state with one-click reset
- Auth bootstrap, RLS policies, guarded work, produce and books RPCs

All three marketplaces are fully interactive in browser demo mode and use live
Supabase workflows for authenticated accounts. When `OPENAI_API_KEY` is
configured, assistance uses GPT-5.6; without it, the same interface remains
testable through labeled deterministic fallbacks.

See [Day 5 development notes](docs/DAY_5_DEVELOPMENT.md) for the newest changes,
verification results and file-copy checklist.

## Product principles

1. **Direct, not opaque:** show pay, bids, dates and counterparties clearly.
2. **Assisted, not automated away:** GPT-5.6 explains and structures; people confirm decisions.
3. **Inclusive by design:** mobile-first screens, plain language and English/Telugu support.
4. **Truthful claims:** demo benchmarks, simulated payments and platform-earned badges are labeled accurately.
5. **One account, many capabilities:** a person can work, hire, farm, buy produce or exchange books.

## Application routes

| Route | Purpose |
| --- | --- |
| `/` | Product story, three marketplaces and visible AI value |
| `/login` | Supabase authentication and interactive demo entry |
| `/onboarding` | Persistent multi-capability profile setup |
| `/dashboard` | Profile, work metrics and marketplace status |
| `/work` | Interactive worker/employer workflow |
| `/produce` | Interactive farmer/buyer bidding and pickup workflow |
| `/books` | Interactive used-book sale and donation workflow |
| `/api/ai/assist` | Validated GPT-5.6 assistance with deterministic fallback |

## Planned demo journeys

### Work

Employer posts a function-hall role → suitable workers apply → employer assigns a worker → work is completed → activity and mutual reviews are recorded.

### Produce

Farmer lists Telangana paddy → buyers place comparable bids → farmer reviews price, quantity and pickup date → one bid is accepted → pickup and reviews are recorded.

### Books

Owner offers a Class 10 book set for donation → learner requests it → owner accepts → both confirm handover → donation activity is recorded.

## How GPT-5.6 is used

- Converts short English or Telugu input into editable structured listings.
- Explains deterministic job matches based on skills, location, availability
  and pay fit without selecting a worker.
- Explains produce-bid tradeoffs after totals are calculated in application
  code.
- Returns Zod-validated structured output through the OpenAI Responses API.
- Falls back safely when credentials or the model are unavailable.

GPT-5.6 will not invent market prices, make final hiring decisions or publish content without user confirmation.

See [`docs/AI_USAGE.md`](docs/AI_USAGE.md) for prompts, safeguards, fallbacks and
judge-testing instructions.

## How Codex is being used

Codex is collaborating across the complete engineering workflow:

- product scope and architecture decisions;
- Next.js foundation and responsive interface implementation;
- database schema and RLS policy design;
- workflow implementation and validation;
- testing, debugging, documentation and deployment preparation.

Key product decisions remain human-directed: the three-marketplace scope, transparent benchmark labeling, deterministic match scoring, multi-role accounts and the decision to avoid unimplemented claims such as escrow or government verification.

## Technology

- Next.js 16 and React 19
- TypeScript
- Tailwind CSS 4
- Supabase PostgreSQL, Auth, Row Level Security and guarded RPCs
- OpenAI JavaScript SDK and GPT-5.6 Responses API
- Zod structured validation
- Vercel deployment
- Vitest unit testing and Playwright end-to-end testing
- GitHub Actions continuous integration

## Local setup

### Prerequisites

- Node.js 20.9 or newer
- npm
- A Supabase project
- An OpenAI API key for AI features

### Install and run

```bash
git clone https://github.com/sanlal/HACKATHONs_Work.git
cd HACKATHONs_Work
npm install
copy .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

Select **Enter interactive demo** on `/login` to test complete workflows without
external credentials. In `/work`, switch between worker and employer views. In
`/produce`, switch between farmer and buyer views to list, bid, compare, accept
and complete a pickup. In `/books`, switch between learner and owner views to
search, request, select and complete a handover.

On macOS or Linux, replace the `copy` command with:

```bash
cp .env.example .env.local
```

### Environment variables

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5.6
```

Never commit `.env.local` or service-role/API secrets.

The AI interface works in labeled fallback mode without an API key. A valid
`OPENAI_API_KEY` and access to the configured `OPENAI_MODEL` are required to
show the **Live GPT-5.6** badge.

### Database

Run migrations in filename order:

```text
supabase/migrations/202607140001_initial_schema.sql
supabase/migrations/202607150001_auth_and_workflow.sql
supabase/migrations/202607150002_produce_workflow.sql
supabase/migrations/202607160001_books_and_trust.sql
supabase/migrations/202607170001_submission_hardening.sql
```

The seed file contains explicitly labeled demo-only benchmark values:

```text
supabase/seed.sql
```

For a linked Supabase CLI project:

```bash
supabase db push
supabase db seed
```

## Commands

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
npm run start
```

## Data and safety notes

- Market benchmark values currently included in the repository are fictional demonstration data, not live mandi prices or financial advice.
- Payment records will initially represent simulated or externally completed payments, not escrow.
- “Trust” signals will come from transparent platform activity and community reviews, not government identity verification.
- School-transport listings will require explicit document and reference fields before the workflow is demonstrated.

## Delivery plan

1. Foundation and schema — complete
2. Authentication, profiles and work workflow — complete
3. Farmer listings and bidding — complete
4. Book sale/donation and shared trust layer — complete
5. GPT-5.6 features and bilingual assistance — complete
6. Testing, accessibility and deployment preparation — complete
7. Video and Devpost submission package — complete; public URLs require owner action

## Repository and submission

- Repository: <https://github.com/sanlal/HACKATHONs_Work>
- Track: Apps for Your Life
- License: MIT
- Demo: follow [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md), then add the public URL
- Video: record [`docs/DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md), then add the public URL
- Codex `/feedback` session ID: will be added to the Devpost submission

## License

Released under the [MIT License](LICENSE).
