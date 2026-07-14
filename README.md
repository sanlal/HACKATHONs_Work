# HACKATHONs_Work

## Complete Build Plan (Start to Submission)

Project: **KaamSetu**  
Vision: one platform for **direct jobs**, **direct farmer sales**, and **second-hand/donation books**.

---

## 1) Scope Lock (Most Important)

Build only these 3 modules with one shared trust/payment layer:

- **Module A: Work Marketplace** (urban + rural)
- **Module B: Farmer Direct Market**
- **Module C: Used Books + Donation**
- **Shared Layer:** auth, profile verification, ratings, transaction history, notifications, multilingual support

### Non-negotiable rule
If any feature is not needed for demo flow, push it to “future roadmap.”

---

## 2) User Roles

- Worker
- Employer
- Farmer
- Buyer (produce buyer)
- Book Seller/Donor
- Book Buyer/Requester
- Admin (light, optional for MVP)

One user can have multiple roles.

---

## 3) Core User Journeys (Demo-critical)

### Journey 1: Job flow
Employer posts job → workers matched → worker accepts → job completed → payment marked → both rate each other.

### Journey 2: Farmer flow
Farmer lists paddy produce → buyers place bids → farmer compares fair range + bids → accepts best bid → transaction logged.

### Journey 3: Book flow
Student lists used books or donation → nearby user requests/buys → handover/pickup confirmed → rating/thank-you record.

---

## 4) 8-Day Execution Plan

### Day 1: Product + Design Freeze
- Finalize feature list (MVP only)
- Create wireframes for 8–10 key screens
- Define DB schema and API contracts
- Decide exact demo story (3 journeys above)

### Day 2: Foundation
- Setup repo, auth, roles
- Create base layout + navbar + role switch
- Setup DB migrations/tables
- Seed sample users/data

### Day 3: Work Module
- Worker profile CRUD
- Job post/create/list view
- Apply/accept/reject logic
- Status transitions (`open -> assigned -> completed`)
- Basic rating after completion

### Day 4: Farmer Module
- Produce listing create/list
- Bidding flow
- Accept bid
- Fair price guidance placeholder + AI explanation
- Transaction log entry

### Day 5: Books Module
- Book list create (sell/donate)
- Filter by class/subject/location
- Request/buy flow
- Pickup/complete state
- Donation success acknowledgment

### Day 6: Shared Value Features
- Unified notifications
- Unified wallet/history page (even mocked)
- Multilingual text (English + Telugu)
- Trust badges (simple rule-based)

### Day 7: Polish + Testing + README
- UI consistency pass
- Bug fixing
- End-to-end manual tests (all 3 journeys)
- README + setup + API + demo credentials
- Deployment

### Day 8: Submission Assets
- Record 3-minute YouTube demo
- Fill Devpost form
- Add Codex/GPT-5.6 usage details
- Final checklist and submit early

---

## 5) MVP Feature Matrix (Build vs Skip)

### Build now
- Login/signup (or mocked OTP)
- Role-based dashboard
- Post/list/bid/apply/accept/complete flows
- Ratings
- Transaction history
- Search + filters
- Bilingual UI

### Skip for now
- Full escrow
- Advanced fraud engine
- Complex analytics
- Native mobile app
- Full admin panel

---

## 6) Suggested Tech Architecture

- **Frontend:** Next.js + Tailwind
- **Backend:** Next API routes / Express
- **DB:** PostgreSQL (Supabase/Neon)
- **Auth:** Supabase Auth / Firebase
- **Maps:** simple city+area first, GPS optional
- **Payments:** mocked transaction + optional Razorpay test
- **AI (GPT-5.6):**
  - match explanation
  - price guidance explanation
  - multilingual listing helper
- **Codex:** rapid coding, refactor, bug fixes, tests

---

## 7) Data Model (Essential Tables)

- `users`
- `user_roles`
- `worker_profiles`
- `jobs`
- `job_applications`
- `produce_listings`
- `produce_bids`
- `book_listings`
- `book_requests`
- `transactions`
- `reviews`
- `notifications`

Keep statuses as enums to avoid logic chaos.

---

## 8) API Plan (Minimum)

- Auth: `/auth/*`
- Profile: `/profiles/*`
- Jobs: `/jobs`, `/jobs/:id`, `/jobs/:id/apply`, `/jobs/:id/assign`, `/jobs/:id/complete`
- Produce: `/produce`, `/produce/:id/bids`, `/produce/:id/accept-bid`
- Books: `/books`, `/books/:id/request`, `/books/:id/complete`
- Reviews: `/reviews`
- Transactions: `/transactions`
- AI helper: `/ai/match-explain`, `/ai/fair-price`, `/ai/listing-assist`

---

## 9) UI Screens List (Build These First)

- Landing page
- Role selection onboarding
- Worker profile
- Employer job post + job list
- Job details + apply/accept
- Farmer listing page
- Buyer bid page
- Books marketplace page
- Transaction history page
- Rating/review modal
- Notifications panel

---

## 10) Uniqueness Strategy (Judge-facing)

Your uniqueness is not “many features.”  
It is **one integrated livelihood platform** across:

- income from work,
- income from produce,
- access to education resources (books).

Add one statement everywhere:
**“From earning to learning: direct opportunities without middlemen.”**

---

## 11) Demo Script Plan (3 Minutes)

- 0:00–0:25 Problem + vision
- 0:25–1:10 Job flow
- 1:10–1:55 Farmer flow
- 1:55–2:30 Books/donation flow
- 2:30–2:50 GPT-5.6 + Codex usage
- 2:50–3:00 Impact + next steps

---

## 12) Devpost Content Plan

Prepare these before final day:

- Problem
- Solution
- How built
- AI/Codex usage
- Challenges
- Accomplishments
- What next
- Repo URL
- YouTube demo
- `/feedback` session ID

---

## 13) Risk Control Plan

- **Scope creep:** freeze features after Day 1
- **Bugs late stage:** feature stop by Day 6 night
- **Demo failure:** record backup walkthrough
- **Timezone miss:** submit at least 6 hours early

---

## 14) Daily Checklist (Use Every Night)

- Is each module still end-to-end workable?
- Any broken flow in core journeys?
- Is AI usage visible and meaningful?
- Is README updated with today’s changes?
- Is tomorrow’s priority written clearly?

---

If you want, next I’ll give you a **task-by-task coding checklist** (exact order of files/components/apis to build) so you can execute without confusion.
