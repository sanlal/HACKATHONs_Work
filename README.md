# JeevanDwaar

**One trusted platform connecting local workers and service providers to fair-paying jobs, farmers to direct buyers, and learners to affordable or donated books—all powered by GPT-5.6.**

JeevanDwaar is a mobile-first, multilingual livelihood platform being built for [OpenAI Build Week](https://openai.devpost.com/). It brings three direct community marketplaces into one coherent experience:

- **Local work and services:** workers discover clearly described, fair-paying opportunities and employers find available local talent.
- **Farmer direct market:** farmers list produce, compare transparent buyer bids and choose the most suitable offer.
- **Books for all:** people sell useful second-hand books or donate them directly to learners.

## Current status

Day 3 is complete:

- Supabase-ready email sign-up/sign-in and auth callback
- No-credential interactive demo access
- Persistent multi-capability profile onboarding
- Dashboard with work and produce marketplace metrics
- Complete local-work journey: post → apply → select → start → complete
- Deterministic, transparent skill-match scoring
- Complete produce journey: list → bid → compare → accept → confirm pickup
- Transparent bid totals, benchmark differences and pickup terms
- Clearly dated and labeled demonstration price benchmarks
- Browser-persisted demo state with one-click reset
- Auth bootstrap, RLS policies, guarded work and produce RPCs

The work and farmer marketplaces are fully interactive in demo mode. When
Supabase variables and migrations are configured, account and profile data use
Supabase. The books page remains a preview for Day 4.

See [Day 3 development notes](docs/DAY_3_DEVELOPMENT.md) for the newest changes,
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
| `/books` | Used-book sale and donation discovery |

## Planned demo journeys

### Work

Employer posts a function-hall role → suitable workers apply → employer assigns a worker → work is completed → activity and mutual reviews are recorded.

### Produce

Farmer lists Telangana paddy → buyers place comparable bids → farmer reviews price, quantity and pickup date → one bid is accepted → pickup and reviews are recorded.

### Books

Owner offers a Class 10 book set for donation → learner requests it → owner accepts → both confirm handover → donation activity is recorded.

## How GPT-5.6 will be used

- Convert short English or Telugu input into editable structured listings.
- Explain deterministic job matches based on skills, location, availability and pay fit.
- Explain produce-bid tradeoffs after totals are calculated in code.
- Provide validated structured output with deterministic fallbacks.

GPT-5.6 will not invent market prices, make final hiring decisions or publish content without user confirmation.

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
- Supabase PostgreSQL, Auth, Storage and Row Level Security
- OpenAI GPT-5.6 API
- Zod structured validation
- Vercel deployment
- Playwright end-to-end testing (planned)

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
and complete a pickup.

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

### Database

Run migrations in filename order:

```text
supabase/migrations/202607140001_initial_schema.sql
supabase/migrations/202607150001_auth_and_workflow.sql
supabase/migrations/202607150002_produce_workflow.sql
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
4. Book sale/donation and shared trust layer
5. GPT-5.6 features and bilingual assistance
6. Testing, accessibility, deployment and demo accounts
7. Video, Devpost materials and final submission

## Repository and submission

- Repository: <https://github.com/sanlal/HACKATHONs_Work>
- Track: Apps for Your Life
- License: MIT
- Demo: deployment URL will be added after Day 6
- Video: public YouTube URL will be added before submission
- Codex `/feedback` session ID: will be added to the Devpost submission

## License

Released under the [MIT License](LICENSE).
