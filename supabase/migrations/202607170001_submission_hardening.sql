-- Submission hardening: participant reads, protected lifecycle fields,
-- consistent trust accounting and review-derived ratings.

drop policy if exists "Users manage their profile" on public.profiles;
create policy "Users update their public profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Trust columns are maintained only by security-definer workflow functions
-- and database triggers, never directly by browser clients.
revoke update on public.profiles from authenticated;
grant update (
  display_name,
  phone,
  preferred_language,
  city,
  area,
  avatar_url,
  updated_at
) on public.profiles to authenticated;

-- Listing owners may edit descriptive fields, but status and counterparty
-- fields can move only through guarded RPCs.
revoke update on public.jobs from authenticated;
grant update (
  title,
  category,
  description,
  city,
  area,
  starts_at,
  ends_at,
  pay_amount,
  pay_period,
  workers_needed,
  requirements,
  updated_at
) on public.jobs to authenticated;

revoke update on public.produce_listings from authenticated;
grant update (
  crop,
  variety,
  quantity,
  unit,
  grade,
  harvest_date,
  expected_price_per_unit,
  city,
  area,
  pickup_notes,
  updated_at
) on public.produce_listings to authenticated;

revoke update on public.book_listings from authenticated;
grant update (
  title,
  author,
  course_or_class,
  subject,
  book_language,
  condition,
  mode,
  price,
  city,
  area,
  updated_at
) on public.book_listings to authenticated;

create or replace function public.is_job_participant(
  p_job_id uuid,
  p_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.job_applications
    where job_id = p_job_id and worker_id = p_user_id
  );
$$;

create or replace function public.is_produce_participant(
  p_listing_id uuid,
  p_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.produce_bids
    where listing_id = p_listing_id and buyer_id = p_user_id
  );
$$;

create or replace function public.is_book_participant(
  p_listing_id uuid,
  p_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.book_requests
    where listing_id = p_listing_id and requester_id = p_user_id
  );
$$;

revoke all on function public.is_job_participant(uuid, uuid) from public;
revoke all on function public.is_produce_participant(uuid, uuid) from public;
revoke all on function public.is_book_participant(uuid, uuid) from public;
grant execute on function public.is_job_participant(uuid, uuid) to authenticated;
grant execute on function public.is_produce_participant(uuid, uuid) to authenticated;
grant execute on function public.is_book_participant(uuid, uuid) to authenticated;

drop policy if exists "Open jobs are readable" on public.jobs;
create policy "Jobs are readable by discovery and participants"
  on public.jobs for select using (
    status = 'open'
    or auth.uid() = employer_id
    or public.is_job_participant(id, auth.uid())
  );

drop policy if exists "Open produce is readable" on public.produce_listings;
create policy "Produce is readable by discovery and participants"
  on public.produce_listings for select using (
    status = 'open'
    or auth.uid() = farmer_id
    or public.is_produce_participant(id, auth.uid())
  );

drop policy if exists "Open books are readable" on public.book_listings;
create policy "Books are readable by discovery and participants"
  on public.book_listings for select using (
    status = 'open'
    or auth.uid() = owner_id
    or public.is_book_participant(id, auth.uid())
  );

create index if not exists activity_actor_created_idx
  on public.activity_records (actor_id, created_at desc);
create index if not exists activity_counterparty_created_idx
  on public.activity_records (counterparty_id, created_at desc);
create index if not exists reviews_reviewee_created_idx
  on public.reviews (reviewee_id, created_at desc);

create or replace function public.notify_job_application()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  selected_job public.jobs%rowtype;
begin
  select * into selected_job from public.jobs where id = new.job_id;
  insert into public.notifications (user_id, title, body, href)
  values (
    selected_job.employer_id,
    'New work application',
    'A worker applied for ' || selected_job.title,
    '/work'
  );
  return new;
end;
$$;

drop trigger if exists on_job_application_notify on public.job_applications;
create trigger on_job_application_notify
  after insert on public.job_applications
  for each row execute procedure public.notify_job_application();

create or replace function public.accept_job_application(application_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  selected_application public.job_applications%rowtype;
  selected_job public.jobs%rowtype;
  accepted_count integer;
begin
  select * into selected_application
  from public.job_applications
  where id = application_id
  for update;

  if not found then
    raise exception 'Application not found';
  end if;

  select * into selected_job
  from public.jobs
  where id = selected_application.job_id
  for update;

  if selected_job.employer_id <> auth.uid() then
    raise exception 'Only the employer can accept an application';
  end if;
  if selected_job.status <> 'open'
     or selected_application.status <> 'pending' then
    raise exception 'This application can no longer be accepted';
  end if;

  update public.job_applications
  set status = 'accepted'
  where id = application_id;

  select count(*) into accepted_count
  from public.job_applications
  where job_id = selected_job.id and status = 'accepted';

  if accepted_count >= selected_job.workers_needed then
    update public.job_applications
    set status = 'rejected'
    where job_id = selected_job.id and status = 'pending';

    update public.jobs
    set status = 'assigned', updated_at = now()
    where id = selected_job.id;
  end if;

  insert into public.notifications (user_id, title, body, href)
  values (
    selected_application.worker_id,
    'Application accepted',
    'You were selected for ' || selected_job.title,
    '/work'
  );
end;
$$;

create or replace function public.transition_job(
  job_id uuid,
  next_status public.job_status
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  selected_job public.jobs%rowtype;
begin
  select * into selected_job
  from public.jobs
  where id = job_id
  for update;

  if not found then
    raise exception 'Job not found';
  end if;
  if selected_job.employer_id <> auth.uid() then
    raise exception 'Only the employer can update this job';
  end if;
  if not (
    (selected_job.status = 'assigned' and next_status in ('in_progress', 'cancelled'))
    or (selected_job.status = 'in_progress' and next_status in ('completed', 'cancelled'))
    or (selected_job.status = 'open' and next_status = 'cancelled')
  ) then
    raise exception 'Invalid job status transition';
  end if;

  update public.jobs
  set status = next_status, updated_at = now()
  where id = job_id;

  if next_status = 'completed' then
    insert into public.activity_records (
      actor_id,
      counterparty_id,
      domain,
      subject_id,
      event_type,
      amount,
      details
    )
    select
      selected_job.employer_id,
      applications.worker_id,
      'work',
      selected_job.id,
      'job_completed',
      selected_job.pay_amount,
      jsonb_build_object(
        'title', selected_job.title,
        'pay_period', selected_job.pay_period
      )
    from public.job_applications as applications
    where applications.job_id = selected_job.id
      and applications.status = 'accepted';

    insert into public.notifications (user_id, title, body, href)
    select
      applications.worker_id,
      'Work completed',
      selected_job.title || ' was marked complete. You can now leave a review.',
      '/dashboard'
    from public.job_applications as applications
    where applications.job_id = selected_job.id
      and applications.status = 'accepted';
  end if;
end;
$$;

create or replace function public.apply_activity_trust()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- The books workflow already maintained these counters before this
  -- migration. Work and produce now receive the same accounting.
  if new.domain in ('work', 'produce') then
    update public.profiles
    set completed_exchanges = completed_exchanges + 1, updated_at = now()
    where id = new.actor_id or id = new.counterparty_id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_activity_recorded_apply_trust
  on public.activity_records;
create trigger on_activity_recorded_apply_trust
  after insert on public.activity_records
  for each row execute procedure public.apply_activity_trust();

create or replace function public.recalculate_profile_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set
    average_rating = coalesce(
      (
        select round(avg(reviews.rating)::numeric, 1)
        from public.reviews
        where reviews.reviewee_id = new.reviewee_id
      ),
      0
    ),
    updated_at = now()
  where id = new.reviewee_id;
  return new;
end;
$$;

drop trigger if exists on_review_created_recalculate_rating
  on public.reviews;
create trigger on_review_created_recalculate_rating
  after insert on public.reviews
  for each row execute procedure public.recalculate_profile_rating();

-- Keep browser clients on the validated mutation paths.
revoke all on function public.accept_job_application(uuid) from public;
revoke all on function public.transition_job(uuid, public.job_status) from public;
revoke all on function public.place_produce_bid(uuid, numeric, numeric, date, text) from public;
revoke all on function public.accept_produce_bid(uuid) from public;
revoke all on function public.confirm_produce_pickup(uuid) from public;
revoke all on function public.request_book(uuid, text) from public;
revoke all on function public.accept_book_request(uuid) from public;
revoke all on function public.confirm_book_handover(uuid) from public;

grant execute on function public.accept_job_application(uuid) to authenticated;
grant execute on function public.transition_job(uuid, public.job_status) to authenticated;
grant execute on function public.place_produce_bid(uuid, numeric, numeric, date, text) to authenticated;
grant execute on function public.accept_produce_bid(uuid) to authenticated;
grant execute on function public.confirm_produce_pickup(uuid) to authenticated;
grant execute on function public.request_book(uuid, text) to authenticated;
grant execute on function public.accept_book_request(uuid) to authenticated;
grant execute on function public.confirm_book_handover(uuid) to authenticated;
