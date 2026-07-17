# Manual deployment guide

This guide keeps account ownership and secrets with the project owner. The
assistant does not push to GitHub or deploy to external accounts.

## 1. Supabase

1. Create a Supabase project.
2. Open **SQL Editor** and run these files in filename order:

```text
supabase/migrations/202607140001_initial_schema.sql
supabase/migrations/202607150001_auth_and_workflow.sql
supabase/migrations/202607150002_produce_workflow.sql
supabase/migrations/202607160001_books_and_trust.sql
supabase/migrations/202607170001_submission_hardening.sql
supabase/seed.sql
```

3. In **Authentication → URL configuration**, set:

```text
Site URL: https://YOUR-VERCEL-DOMAIN.vercel.app
Redirect URL: https://YOUR-VERCEL-DOMAIN.vercel.app/auth/callback
Local redirect: http://localhost:3000/auth/callback
```

4. Copy the project URL and anon key from **Project Settings → API**.
5. Never expose the service-role key in browser code.

## 2. OpenAI

Create an API key with access to the configured model. JeevanDwaar defaults to:

```text
OPENAI_MODEL=gpt-5.6
```

The key is used only in the server route. Without it, the UI displays a
truthfully labeled deterministic fallback.

## 3. Vercel

1. Copy the complete project to GitHub.
2. Import the repository in Vercel.
3. Keep the detected framework as **Next.js**.
4. Add these production environment variables:

```text
NEXT_PUBLIC_SITE_URL=https://YOUR-VERCEL-DOMAIN.vercel.app
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
OPENAI_API_KEY=your_openai_key
OPENAI_MODEL=gpt-5.6
```

5. Deploy.
6. Update Supabase Site URL if Vercel assigned a different production domain.
7. Redeploy after changing environment variables.

## 4. Demo accounts

Create accounts through the application rather than inserting rows into
`auth.users` manually:

```text
Employer/farmer/book owner
Worker/produce buyer/book requester
```

Use onboarding to choose the matching capabilities and worker skills. Use two
separate browsers or one normal and one private window to demonstrate
counterparty flows and mutual confirmation.

Do not publish account passwords in the repository. Put judge credentials only
in the private Devpost testing instructions if the event permits them.

## 5. Production smoke test

Verify:

```text
/
/login
/onboarding
/dashboard
/work
/produce
/books
/api/ai/assist
```

Then test:

1. sign-up and email confirmation;
2. onboarding and capability persistence;
3. work post → application → acceptance → completion;
4. produce listing → bid → acceptance → both confirm;
5. book listing → request → acceptance → both confirm;
6. dashboard notifications, review and rating update;
7. English/Telugu navigation and AI assistance;
8. **Live GPT-5.6** badge on an authenticated or demo session.

## 6. Rollback and troubleshooting

- If live data cannot load, verify all five migrations ran successfully.
- If auth redirects fail, verify the exact callback URL in Supabase.
- If AI shows **Safe fallback**, verify the OpenAI key/model and redeploy.
- If a marketplace shows **Browser demo**, verify the account is signed in and
  the public Supabase variables are present.
- Browser demo data is isolated in localStorage and never enters Supabase.
