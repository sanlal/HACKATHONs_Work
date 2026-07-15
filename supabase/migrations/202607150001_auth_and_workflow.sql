-- Day 2: account bootstrap, profile/capability authorization and guarded work
-- marketplace transitions.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, city, preferred_language)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), 'JeevanDwaar member'),
    coalesce(nullif(new.raw_user_meta_data ->> 'city', ''), 'Hyderabad'),
    'en'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create policy "Capabilities are readable"
  on public.user_capabilities for select using (true);
create policy "Users create their capabilities"
  on public.user_capabilities for insert with check (auth.uid() = user_id);
create policy "Users delete their capabilities"
  on public.user_capabilities for delete using (auth.uid() = user_id);

create policy "Worker profiles are readable"
  on public.worker_profiles for select using (true);
create policy "Users create their worker profile"
  on public.worker_profiles for insert with check (auth.uid() = user_id);
create policy "Users update their worker profile"
  on public.worker_profiles for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Applications visible to participants"
  on public.job_applications for select using (
    auth.uid() = worker_id
    or exists (
      select 1 from public.jobs
      where jobs.id = job_applications.job_id
        and jobs.employer_id = auth.uid()
    )
  );
create policy "Workers apply to open jobs"
  on public.job_applications for insert with check (
    auth.uid() = worker_id
    and exists (
      select 1 from public.jobs
      where jobs.id = job_applications.job_id
        and jobs.status = 'open'
        and jobs.employer_id <> auth.uid()
    )
  );
create policy "Workers withdraw pending applications"
  on public.job_applications for update
  using (auth.uid() = worker_id and status = 'pending')
  with check (auth.uid() = worker_id and status = 'withdrawn');

create policy "Participants read activity"
  on public.activity_records for select using (
    auth.uid() = actor_id or auth.uid() = counterparty_id
  );

create policy "Participants create reviews"
  on public.reviews for insert with check (
    auth.uid() = reviewer_id
    and exists (
      select 1 from public.activity_records
      where activity_records.id = reviews.activity_id
        and (
          activity_records.actor_id = auth.uid()
          or activity_records.counterparty_id = auth.uid()
        )
        and reviews.reviewee_id in (
          activity_records.actor_id,
          activity_records.counterparty_id
        )
    )
  );

create or replace function public.accept_job_application(application_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  selected_application public.job_applications%rowtype;
  selected_job public.jobs%rowtype;
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

  if selected_job.status <> 'open' then
    raise exception 'This job is no longer open';
  end if;

  update public.job_applications
  set status = case when id = application_id then 'accepted'::public.application_status
                    else 'rejected'::public.application_status end
  where job_id = selected_job.id and status = 'pending';

  update public.jobs
  set status = 'assigned', updated_at = now()
  where id = selected_job.id;

  insert into public.notifications (user_id, title, body, href)
  values (
    selected_application.worker_id,
    'Application accepted',
    'You were selected for ' || selected_job.title,
    '/work'
  );
end;
$$;

create or replace function public.transition_job(job_id uuid, next_status public.job_status)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  selected_job public.jobs%rowtype;
  selected_worker uuid;
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
    select worker_id into selected_worker
    from public.job_applications
    where job_applications.job_id = selected_job.id
      and status = 'accepted'
    limit 1;

    if selected_worker is not null then
      insert into public.activity_records (
        actor_id,
        counterparty_id,
        domain,
        subject_id,
        event_type,
        amount,
        details
      ) values (
        selected_job.employer_id,
        selected_worker,
        'work',
        selected_job.id,
        'job_completed',
        selected_job.pay_amount,
        jsonb_build_object(
          'title', selected_job.title,
          'pay_period', selected_job.pay_period
        )
      );

      insert into public.notifications (user_id, title, body, href)
      values (
        selected_worker,
        'Work completed',
        selected_job.title || ' was marked complete. You can now leave a review.',
        '/dashboard'
      );
    end if;
  end if;
end;
$$;

grant execute on function public.accept_job_application(uuid) to authenticated;
grant execute on function public.transition_job(uuid, public.job_status) to authenticated;
