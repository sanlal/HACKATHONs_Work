create extension if not exists "pgcrypto";

create type public.user_capability as enum (
  'worker', 'employer', 'farmer', 'produce_buyer', 'book_owner', 'book_requester'
);
create type public.job_status as enum ('open', 'assigned', 'in_progress', 'completed', 'cancelled');
create type public.application_status as enum ('pending', 'accepted', 'rejected', 'withdrawn');
create type public.listing_status as enum ('open', 'reserved', 'completed', 'cancelled');
create type public.request_status as enum ('pending', 'accepted', 'rejected', 'withdrawn', 'completed');
create type public.book_mode as enum ('sell', 'donate');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 80),
  phone text,
  preferred_language text not null default 'en' check (preferred_language in ('en', 'te')),
  city text not null,
  area text,
  avatar_url text,
  average_rating numeric(2,1) not null default 0 check (average_rating between 0 and 5),
  completed_exchanges integer not null default 0 check (completed_exchanges >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_capabilities (
  user_id uuid not null references public.profiles(id) on delete cascade,
  capability public.user_capability not null,
  created_at timestamptz not null default now(),
  primary key (user_id, capability)
);

create table public.worker_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  headline text not null,
  skills text[] not null default '{}',
  service_areas text[] not null default '{}',
  expected_pay_min integer check (expected_pay_min >= 0),
  pay_period text check (pay_period in ('hour', 'shift', 'day', 'month')),
  available_from date,
  travel_preference text,
  updated_at timestamptz not null default now()
);

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 5 and 120),
  category text not null,
  description text not null,
  city text not null,
  area text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  pay_amount integer not null check (pay_amount > 0),
  pay_period text not null check (pay_period in ('hour', 'shift', 'day', 'month')),
  workers_needed integer not null default 1 check (workers_needed between 1 and 100),
  requirements text[] not null default '{}',
  status public.job_status not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or ends_at > starts_at)
);

create table public.job_applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  worker_id uuid not null references public.profiles(id) on delete cascade,
  message text,
  deterministic_match_score integer check (deterministic_match_score between 0 and 100),
  status public.application_status not null default 'pending',
  created_at timestamptz not null default now(),
  unique (job_id, worker_id)
);

create table public.produce_listings (
  id uuid primary key default gen_random_uuid(),
  farmer_id uuid not null references public.profiles(id) on delete cascade,
  crop text not null,
  variety text,
  quantity numeric(12,2) not null check (quantity > 0),
  unit text not null check (unit in ('kg', 'quintal', 'tonne')),
  grade text,
  harvest_date date not null,
  expected_price_per_unit numeric(12,2) check (expected_price_per_unit > 0),
  city text not null,
  area text,
  pickup_notes text,
  status public.listing_status not null default 'open',
  accepted_bid_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.produce_bids (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.produce_listings(id) on delete cascade,
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  quantity numeric(12,2) not null check (quantity > 0),
  price_per_unit numeric(12,2) not null check (price_per_unit > 0),
  pickup_date date not null,
  notes text,
  status public.application_status not null default 'pending',
  created_at timestamptz not null default now(),
  unique (listing_id, buyer_id)
);

alter table public.produce_listings
  add constraint produce_listings_accepted_bid_fkey
  foreign key (accepted_bid_id) references public.produce_bids(id) on delete set null;

create table public.price_benchmarks (
  id uuid primary key default gen_random_uuid(),
  crop text not null,
  variety text,
  market_name text not null,
  state text not null,
  unit text not null,
  minimum_price numeric(12,2) not null,
  modal_price numeric(12,2) not null,
  maximum_price numeric(12,2) not null,
  observed_on date not null,
  source_name text not null,
  source_url text,
  is_demo boolean not null default true,
  created_at timestamptz not null default now(),
  check (minimum_price <= modal_price and modal_price <= maximum_price)
);

create table public.book_listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  author text,
  course_or_class text,
  subject text,
  book_language text not null default 'English',
  condition text not null check (condition in ('like_new', 'good', 'fair')),
  mode public.book_mode not null,
  price integer check (
    (mode = 'donate' and price is null) or
    (mode = 'sell' and price is not null and price > 0)
  ),
  city text not null,
  area text,
  status public.listing_status not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.book_requests (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.book_listings(id) on delete cascade,
  requester_id uuid not null references public.profiles(id) on delete cascade,
  message text,
  status public.request_status not null default 'pending',
  created_at timestamptz not null default now(),
  unique (listing_id, requester_id)
);

create table public.activity_records (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references public.profiles(id) on delete cascade,
  counterparty_id uuid references public.profiles(id) on delete set null,
  domain text not null check (domain in ('work', 'produce', 'books')),
  subject_id uuid not null,
  event_type text not null,
  amount numeric(12,2),
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  reviewee_id uuid not null references public.profiles(id) on delete cascade,
  activity_id uuid not null references public.activity_records(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (reviewer_id, activity_id),
  check (reviewer_id <> reviewee_id)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text not null,
  href text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index jobs_discovery_idx on public.jobs (status, city, category, starts_at);
create index produce_discovery_idx on public.produce_listings (status, city, crop, harvest_date);
create index books_discovery_idx on public.book_listings (status, city, mode, subject);
create index notifications_user_idx on public.notifications (user_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.user_capabilities enable row level security;
alter table public.worker_profiles enable row level security;
alter table public.jobs enable row level security;
alter table public.job_applications enable row level security;
alter table public.produce_listings enable row level security;
alter table public.produce_bids enable row level security;
alter table public.price_benchmarks enable row level security;
alter table public.book_listings enable row level security;
alter table public.book_requests enable row level security;
alter table public.activity_records enable row level security;
alter table public.reviews enable row level security;
alter table public.notifications enable row level security;

create policy "Public profiles are readable" on public.profiles for select using (true);
create policy "Users manage their profile" on public.profiles for all
  using (auth.uid() = id) with check (auth.uid() = id);

create policy "Open jobs are readable" on public.jobs for select using (status = 'open' or auth.uid() = employer_id);
create policy "Employers create jobs" on public.jobs for insert with check (auth.uid() = employer_id);
create policy "Employers update jobs" on public.jobs for update using (auth.uid() = employer_id);

create policy "Open produce is readable" on public.produce_listings for select using (status = 'open' or auth.uid() = farmer_id);
create policy "Farmers create produce" on public.produce_listings for insert with check (auth.uid() = farmer_id);
create policy "Farmers update produce" on public.produce_listings for update using (auth.uid() = farmer_id);

create policy "Open books are readable" on public.book_listings for select using (status = 'open' or auth.uid() = owner_id);
create policy "Owners create books" on public.book_listings for insert with check (auth.uid() = owner_id);
create policy "Owners update books" on public.book_listings for update using (auth.uid() = owner_id);

create policy "Benchmarks are readable" on public.price_benchmarks for select using (true);
create policy "Reviews are readable" on public.reviews for select using (true);
create policy "Users read their notifications" on public.notifications for select using (auth.uid() = user_id);
create policy "Users update their notifications" on public.notifications for update using (auth.uid() = user_id);

-- Bid, application, request and completion transitions will be exposed through
-- validated server actions. Their stricter counterparty policies arrive with
-- the corresponding Day 2–4 workflows.
