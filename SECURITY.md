# Security policy

Report suspected vulnerabilities privately through the repository owner's
GitHub security contact. Do not include credentials or personal data in a
public issue.

## Implemented controls

- OpenAI credentials remain server-only.
- AI inputs and structured outputs are bounded and validated.
- Live GPT calls require an authenticated or explicit demo session.
- Same-origin checks and best-effort request limiting protect the AI route.
- Supabase Row Level Security limits reads and writes by participant.
- Lifecycle and trust mutations use guarded PostgreSQL functions/triggers.
- Browser demo data remains in localStorage and is clearly labeled.
- Security response headers block framing and MIME sniffing.

## Accepted dependency advisory

As of July 17, 2026, `npm audit --omit=dev` reports two moderate findings for a
PostCSS version bundled transitively by Next.js 16.2.10. npm's suggested forced
fix would downgrade Next.js to 9.3.3 and break the application, so it is not
applied. Recheck and upgrade Next.js when a stable patched release is
available.

## Scope limitations

JeevanDwaar does not currently provide escrow, identity verification, private
messaging, document verification or payment processing. Do not represent demo
benchmarks as live mandi prices.
