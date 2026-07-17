# JeevanDwaar architecture

## System boundaries

```text
Browser
  -> Next.js App Router
     -> Typed Supabase browser client
        -> Supabase Auth + PostgreSQL + RLS/RPCs
     -> Next.js AI route handler
        -> OpenAI GPT-5.6 Responses API
```

The browser receives only the public Supabase URL and anonymous key. OpenAI and Supabase service-role credentials remain server-only.

## Domain boundaries

### Identity and trust

`profiles` stores shared public identity data. `user_capabilities` allows one account to participate in multiple domains. Reviews, notifications and activity records are shared across all marketplaces.

### Work

`worker_profiles` describes skills and preferences. `jobs` belongs to an employer and `job_applications` links workers to jobs. Guarded PostgreSQL RPCs validate acceptance and lifecycle transitions.

### Produce

`produce_listings` belongs to a farmer and `produce_bids` belongs to buyers. `price_benchmarks` stores source, date and demo status so the interface can distinguish guidance from live prices.

### Books

`book_listings` supports sale and donation modes. `book_requests` records interest and handover state.

## Implemented API contract

Marketplace discovery uses typed Supabase queries under RLS. Important mutations
use guarded PostgreSQL RPCs. AI uses one validated server route.

```text
POST /api/ai/assist
input:  { domain, mode, language, input, context }
output: { data, source, model }
```

All AI inputs and outputs are validated with Zod. Invalid or unavailable model
responses fall back to deterministic copy with an explicit source badge.

## Operating modes

- **Live:** authenticated users query and mutate Supabase.
- **Demo:** users without credentials complete the same fictional journeys in
  browser localStorage.
- The UI labels the active mode and never synchronizes demo records to the live
  database.

## Workflow invariants

- A user cannot apply to, bid on or request their own listing.
- Only an owner can choose a counterparty.
- Exactly one produce bid can be accepted.
- Reviews require a completed activity involving both users.
- Donation listings cannot have a price.
- AI explanations never replace deterministic totals or state checks.
- Public discovery never exposes private contact or payment data.

## Day 1 decisions

- Use a responsive web application to maximize judge access and avoid installation.
- Use Supabase to keep authentication, database, storage and authorization coherent.
- Store city and area directly on listings for the MVP; geospatial search remains a later enhancement.
- Use platform activity records instead of presenting a fake wallet or escrow.
- Start with English and Telugu; structure copy so more languages can be added later.
