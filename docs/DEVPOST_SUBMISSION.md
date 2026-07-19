# Devpost submission draft

## Project name

JeevanDwaar

## Elevator pitch

One multilingual doorway connecting people directly to trusted local work,
fairer farm markets and affordable or donated books—with GPT-5.6 helping every
opportunity become easier to describe, compare and act on.

## Inspiration

Opportunity often exists close to home but remains difficult to discover or
compare. Local workers depend on informal contacts, farmers may receive opaque
offers, and useful books often fail to reach the next learner. These are
different situations with the same underlying problem: people need a direct,
understandable doorway to one another.

JeevanDwaar was designed around dignity and human choice. AI should reduce the
effort of writing and understanding marketplace information, not make
livelihood decisions for people.

## What it does

JeevanDwaar combines three focused marketplaces:

1. **Local work:** employers publish clear opportunities, workers apply with
   declared skills, and deterministic matching is explained in plain language.
2. **Farmer direct market:** farmers list produce and compare buyer offers by
   price, quantity, total value, pickup date and transparent benchmark context.
3. **Books:** people sell affordable used books or donate them directly to
   learners and community groups.

One account can hold multiple capabilities. Completed exchanges create
activity records, notifications and review-derived trust. English and Telugu
navigation and AI assistance support the demo-critical journey.

## How GPT-5.6 is used

GPT-5.6 converts short English or Telugu descriptions into editable work,
produce and book listing fields. It explains deterministic job matches and
produce-bid tradeoffs using only supplied context.

The model cannot publish a listing, select a worker, choose a buyer, choose a
book recipient or invent a market benchmark. Requests and responses are
validated with Zod. When credentials or the model are unavailable, the UI
truthfully displays **Safe fallback** instead of pretending a live call
succeeded.

## How we built it

- Next.js 16, React 19 and TypeScript
- Tailwind CSS 4
- Supabase Auth, PostgreSQL, Row Level Security and guarded RPC workflows
- OpenAI Responses API with GPT-5.6 and Zod structured output
- Browser-persisted no-credential demo fallback
- Vitest, Playwright and GitHub Actions
- Vercel deployment

The live application uses Supabase for authenticated marketplace operations.
The browser demo keeps all fictional activity in localStorage so judges can
evaluate the complete UX without receiving credentials.

## Challenges

The hardest challenge was preserving a coherent experience across three
marketplaces without hiding important decisions inside AI. We separated
deterministic calculations from model explanations, modeled state transitions
as guarded database functions, required mutual confirmation for produce and
book handovers, and retained an explicit demo mode that never masquerades as
production data.

## Accomplishments

- Three end-to-end marketplace journeys in one consistent product
- Live Supabase paths plus a full no-credential demo
- Human-controlled GPT-5.6 assistance in English and Telugu
- Explainable matching and bid comparisons
- Activity-earned trust with review-derived ratings
- Structured AI validation, protected secrets and visible fallbacks
- Responsive, keyboard-accessible interface with automated checks

## What we learned

AI is most useful here as a translator between natural language and structured
choices. Keeping totals, scores, authorization and state transitions outside
the model makes the result easier to test and trust. Clear fallback labels are
also essential: a reliable demo should never require an unsupported claim.

## What's next

- Voice input and audio playback for low-literacy access
- More Indian languages
- Verified external mandi data integrations
- Document/reference workflows for safety-sensitive roles
- Moderation and dispute-resolution tools
- Location-aware discovery and privacy-preserving contact exchange

## Try it out

Live demo: `[ADD VERCEL URL]`

Repository: <https://github.com/sanlal/HACKATHONs_Work>

1. Choose **Enter interactive demo** for the credential-free journey.
2. Visit all three marketplaces and switch roles.
3. Use GPT-5.6 assistance on a listing.
4. Open the dashboard to see activity-earned trust.

## Video

Public video URL: `[ADD YOUTUBE OR VIMEO URL]`

## Built with

`openai` `gpt-5.6` `next.js` `react` `typescript` `supabase` `postgresql`
`tailwind-css` `zod` `playwright` `vitest` `vercel`

## Submission details

- Track: Apps for Your Life
- License: MIT
- Codex feedback/session ID: ``
- Team members: `Ramavath Santhosh`
