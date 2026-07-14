# JeevanDwaar architecture

## System boundaries

```text
Browser
  -> Next.js App Router
     -> Server actions / route handlers
        -> Supabase Auth + PostgreSQL + Storage
        -> OpenAI GPT-5.6
```

The browser receives only the public Supabase URL and anonymous key. OpenAI and Supabase service-role credentials remain server-only.

## Domain boundaries

### Identity and trust

`profiles` stores shared public identity data. `user_capabilities` allows one account to participate in multiple domains. Reviews, notifications and activity records are shared across all marketplaces.

### Work

`worker_profiles` describes skills and preferences. `jobs` belongs to an employer and `job_applications` links workers to jobs. State transitions will be validated server-side.

### Produce

`produce_listings` belongs to a farmer and `produce_bids` belongs to buyers. `price_benchmarks` stores source, date and demo status so the interface can distinguish guidance from live prices.

### Books

`book_listings` supports sale and donation modes. `book_requests` records interest and handover state.

## Initial API contracts

The implementation will prefer typed server actions for mutations and route handlers for AI requests.

```text
POST /api/ai/listing-assist
input:  { domain, language, description }
output: { fields, missingFields, warnings }

POST /api/ai/match-explanation
input:  { jobId, workerId, deterministicScore, factors }
output: { explanation }

POST /api/ai/bid-explanation
input:  { listingId, benchmark, bidsWithCalculatedTotals }
output: { comparison, warnings }
```

All AI outputs will be validated with Zod. Invalid or unavailable model responses fall back to deterministic copy.

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
