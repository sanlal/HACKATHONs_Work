# JeevanDwaar

**One trusted platform connecting local workers and service providers to fair-paying jobs, farmers to direct buyers, and learners to affordable or donated books—all powered by GPT-5.6.**

JeevanDwaar is a mobile-first, multilingual livelihood platform being built for [OpenAI Build Week](https://openai.devpost.com/). It brings three direct community marketplaces into one coherent experience:

- **Local work and services:** workers discover clearly described, fair-paying opportunities and employers find available local talent.
- **Farmer direct market:** farmers list produce, compare transparent buyer bids and choose the most suitable offer.
- **Books for all:** people sell useful second-hand books or donate them directly to learners.

## Current status

Day 1 foundation is complete:

- Next.js 16, React 19 and TypeScript application scaffold
- Mobile-first visual system and responsive landing page
- Preview routes for work, produce and books
- Multi-capability onboarding preview
- Initial PostgreSQL schema, indexes and Row Level Security outline
- Clearly labeled demonstration market benchmarks
- English/Telugu-ready information architecture

The current marketplace cards contain seeded demonstration content. Authentication, persistent workflows and live GPT-5.6 calls are scheduled for the next milestones.

## Product principles

1. **Direct, not opaque:** show pay, bids, dates and counterparties clearly.
2. **Assisted, not automated away:** GPT-5.6 explains and structures; people confirm decisions.
3. **Inclusive by design:** mobile-first screens, plain language and English/Telugu support.
4. **Truthful claims:** demo benchmarks, simulated payments and platform-earned badges are labeled accurately.
5. **One account, many capabilities:** a person can work, hire, farm, buy produce or exchange books.

## Day 1 experience

| Route | Purpose |
| --- | --- |
| `/` | Product story, three marketplaces and visible AI value |
| `/work` | Representative local work and service opportunities |
| `/produce` | Farmer-to-buyer listings and bid-oriented product story |
| `/books` | Used-book sale and donation discovery |
| `/onboarding` | Multi-capability role selection preview |

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

The initial migration is in:

```text
supabase/migrations/202607140001_initial_schema.sql
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

1. Foundation and schema
2. Authentication, profiles and work workflow
3. Farmer listings and bidding
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
