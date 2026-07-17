# Final handoff and complete copy manifest

## Project status

The local codebase is submission-packaged and passes its automated quality
gates. External deployment, public video upload and Devpost submission remain
manual because they require the owner's accounts and credentials.

## What to copy to GitHub

Copy these complete directories, including every nested file:

```text
.github/
docs/
src/
supabase/
tests/
```

Copy these root files:

```text
.env.example
.gitignore
eslint.config.mjs
LICENSE
next-env.d.ts
next.config.ts
package.json
package-lock.json
playwright.config.ts
postcss.config.mjs
README.md
SECURITY.md
tsconfig.json
```

This manifest supersedes the individual Day 2–5 copy lists.

## Do not copy

```text
.env
.env.local
.env.*.local
.git/
.next/
.vercel/
node_modules/
playwright-report/
test-results/
coverage/
tsconfig.tsbuildinfo
```

## After copying

Run:

```text
npm ci
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Then follow:

```text
docs/DEPLOYMENT.md
docs/SCREENSHOTS.md
docs/DEMO_SCRIPT.md
docs/DEVPOST_SUBMISSION.md
docs/SUBMISSION_CHECKLIST.md
```

## Manual values still required

```text
Supabase project URL and anon key
OpenAI API key with GPT-5.6 access
Vercel production URL
YouTube or Vimeo video URL
Team-member names
Codex feedback/session ID
```

Never send or commit passwords, API keys or service-role credentials.
