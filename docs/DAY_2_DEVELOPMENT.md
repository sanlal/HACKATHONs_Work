# Day 2 development — authentication, profiles and work workflow

Date: July 15, 2026

## Goal

Turn the Day 1 product preview into an interactive application with account
entry, multi-role onboarding, a useful dashboard and one complete marketplace
journey.

## What changed

### Authentication

- Added Supabase browser and server client factories.
- Added email sign-up and sign-in.
- Added the PKCE auth callback route.
- Added an interactive demo entry that works without external credentials.
- Added clear messaging when Supabase has not been configured.
- Added sign-out from the dashboard.

### Multi-capability profiles

- Replaced the onboarding preview with a working profile form.
- Users can select multiple capabilities: worker, employer, farmer, produce
  buyer, book owner and book requester.
- Demo profiles persist in browser storage.
- Configured Supabase accounts upsert into `profiles` and
  `user_capabilities`.
- Added English and Telugu preference selection plus city and area.

### Dashboard

- Added a personalized dashboard.
- Added work counts for open jobs, applications and completed jobs.
- Added direct navigation to all three marketplaces.
- Added profile capability display and profile-edit navigation.
- The dashboard reads Supabase profile data when configured and otherwise
  uses the local demo profile.

### Complete work marketplace

- Replaced the static work preview with an interactive worker/employer demo.
- Employer can create a job with category, location, schedule, pay, worker
  count, requirements and description.
- Worker can inspect jobs and apply directly.
- Match score is calculated deterministically from required and available
  skills.
- Employer can review candidates and select one.
- Employer can move a job from assigned to in progress to completed.
- Important events appear in a transparent activity history.
- Demo state persists across page reloads and can be reset.

### Database and authorization

- Added an auth trigger that creates a baseline profile for new Supabase users.
- Added RLS policies for capabilities, worker profiles, applications,
  participant activity and reviews.
- Added `accept_job_application` as a guarded database function.
- Added `transition_job` to validate lifecycle changes and create completion
  activity and notifications.
- Kept secrets server-side and retained `.env.local` in `.gitignore`.

## Two operating modes

### Interactive demo mode

Demo mode activates automatically when Supabase public environment variables
are absent. It uses seeded data and browser storage so judges can complete the
work journey without creating external accounts.

### Supabase mode

When `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are
configured, sign-up, sign-in, profile and capability data use Supabase.

Run both migration files in filename order:

```text
supabase/migrations/202607140001_initial_schema.sql
supabase/migrations/202607150001_auth_and_workflow.sql
```

## How to test Day 2

1. Run `npm install` and `npm run dev`.
2. Open `http://localhost:3000/login`.
3. Select **Enter interactive demo**.
4. Open **Local work** from the dashboard.
5. In worker view, apply to the construction-helper job.
6. Switch to employer view.
7. Review the seeded application on the function-hall job.
8. Select the worker, start the work and mark it complete.
9. Confirm the activity history and dashboard counts update.
10. Use **Reset demo** to restore the starting state.

## Verification completed

The following checks passed:

```text
npm run lint
npm run typecheck
npm run build
```

Runtime smoke checks returned HTTP 200 for:

```text
/
/login
/onboarding
/dashboard
/work
```

IDE diagnostics reported no errors in `src` or `supabase`.

## Current limitations

- The interactive work workflow uses browser-persisted demo data. Database
  workflow functions are prepared but the UI will be connected to them after a
  Supabase project is configured.
- Produce and books remain preview experiences.
- Live GPT-5.6 functionality is scheduled for Day 5.
- Real payments, escrow and government identity verification are not claimed
  or implemented.

## Files to copy to GitHub

Copy these new files:

```text
docs/DAY_2_DEVELOPMENT.md
src/app/auth/callback/route.ts
src/app/dashboard/page.tsx
src/app/login/page.tsx
src/components/auth/login-form.tsx
src/components/work/work-marketplace.tsx
src/lib/supabase/client.ts
src/lib/supabase/config.ts
src/lib/supabase/server.ts
src/lib/work-demo.ts
supabase/migrations/202607150001_auth_and_workflow.sql
```

Replace these existing GitHub files with the updated local versions:

```text
README.md
src/app/layout.tsx
src/app/onboarding/page.tsx
src/app/page.tsx
src/app/work/page.tsx
```

Do not copy generated or secret files:

```text
.env.local
.next/
node_modules/
tsconfig.tsbuildinfo
```
