-- Day 4: book sale/donation requests, mutual handover confirmation and
-- activity-earned trust signals.

alter table public.profiles
  add column fulfilled_donations integer not null default 0
  check (fulfilled_donations >= 0);

alter table public.book_listings
  add column selected_request_id uuid,
  add column owner_confirmed_at timestamptz,
  add column requester_confirmed_at timestamptz;

alter table public.book_listings
  add constraint book_listings_selected_request_fkey
  foreign key (selected_request_id)
  references public.book_requests(id)
  on delete set null;

create policy "Book requests visible to participants"
  on public.book_requests for select using (
    auth.uid() = requester_id
    or exists (
      select 1 from public.book_listings
      where book_listings.id = book_requests.listing_id
        and book_listings.owner_id = auth.uid()
    )
  );

create policy "Learners request open books"
  on public.book_requests for insert with check (
    auth.uid() = requester_id
    and exists (
      select 1 from public.book_listings
      where book_listings.id = book_requests.listing_id
        and book_listings.status = 'open'
        and book_listings.owner_id <> auth.uid()
    )
  );

create or replace function public.request_book(
  p_listing_id uuid,
  p_message text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  selected_listing public.book_listings%rowtype;
  saved_request_id uuid;
begin
  select * into selected_listing
  from public.book_listings
  where id = p_listing_id
  for update;

  if not found then
    raise exception 'Book listing not found';
  end if;

  if selected_listing.status <> 'open' then
    raise exception 'This book is no longer available';
  end if;

  if selected_listing.owner_id = auth.uid() then
    raise exception 'An owner cannot request their own book';
  end if;

  if char_length(trim(coalesce(p_message, ''))) < 10 then
    raise exception 'Add a short message explaining your request';
  end if;

  insert into public.book_requests (
    listing_id,
    requester_id,
    message,
    status
  ) values (
    p_listing_id,
    auth.uid(),
    trim(p_message),
    'pending'
  )
  on conflict (listing_id, requester_id)
  do update set
    message = excluded.message,
    status = 'pending'
  returning id into saved_request_id;

  insert into public.notifications (user_id, title, body, href)
  values (
    selected_listing.owner_id,
    'New book request',
    'Someone requested ' || selected_listing.title,
    '/books'
  );

  return saved_request_id;
end;
$$;

create or replace function public.accept_book_request(p_request_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  selected_request public.book_requests%rowtype;
  selected_listing public.book_listings%rowtype;
begin
  select * into selected_request
  from public.book_requests
  where id = p_request_id
  for update;

  if not found then
    raise exception 'Book request not found';
  end if;

  select * into selected_listing
  from public.book_listings
  where id = selected_request.listing_id
  for update;

  if selected_listing.owner_id <> auth.uid() then
    raise exception 'Only the book owner can select a recipient';
  end if;

  if selected_listing.status <> 'open'
     or selected_request.status <> 'pending' then
    raise exception 'This request can no longer be accepted';
  end if;

  update public.book_requests
  set status = case
    when id = p_request_id then 'accepted'::public.request_status
    else 'rejected'::public.request_status
  end
  where listing_id = selected_listing.id and status = 'pending';

  update public.book_listings
  set
    status = 'reserved',
    selected_request_id = p_request_id,
    owner_confirmed_at = null,
    requester_confirmed_at = null,
    updated_at = now()
  where id = selected_listing.id;

  insert into public.notifications (user_id, title, body, href)
  values (
    selected_request.requester_id,
    'Book request accepted',
    'Your request for ' || selected_listing.title || ' was accepted',
    '/books'
  );
end;
$$;

create or replace function public.confirm_book_handover(p_listing_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  selected_listing public.book_listings%rowtype;
  selected_request public.book_requests%rowtype;
  updated_listing public.book_listings%rowtype;
begin
  select * into selected_listing
  from public.book_listings
  where id = p_listing_id
  for update;

  if not found or selected_listing.status <> 'reserved' then
    raise exception 'Reserved book listing not found';
  end if;

  select * into selected_request
  from public.book_requests
  where id = selected_listing.selected_request_id;

  if auth.uid() = selected_listing.owner_id then
    update public.book_listings
    set owner_confirmed_at = coalesce(owner_confirmed_at, now())
    where id = p_listing_id
    returning * into updated_listing;
  elsif auth.uid() = selected_request.requester_id then
    update public.book_listings
    set requester_confirmed_at = coalesce(requester_confirmed_at, now())
    where id = p_listing_id
    returning * into updated_listing;
  else
    raise exception 'Only the owner or selected recipient can confirm handover';
  end if;

  if updated_listing.owner_confirmed_at is not null
     and updated_listing.requester_confirmed_at is not null then
    update public.book_listings
    set status = 'completed', updated_at = now()
    where id = p_listing_id;

    update public.book_requests
    set status = 'completed'
    where id = selected_request.id;

    update public.profiles
    set
      completed_exchanges = completed_exchanges + 1,
      fulfilled_donations = fulfilled_donations
        + case when selected_listing.mode = 'donate' then 1 else 0 end,
      updated_at = now()
    where id = selected_listing.owner_id;

    update public.profiles
    set completed_exchanges = completed_exchanges + 1, updated_at = now()
    where id = selected_request.requester_id;

    insert into public.activity_records (
      actor_id,
      counterparty_id,
      domain,
      subject_id,
      event_type,
      amount,
      details
    ) values (
      selected_listing.owner_id,
      selected_request.requester_id,
      'books',
      selected_listing.id,
      case
        when selected_listing.mode = 'donate'
          then 'book_donation_completed'
        else 'book_sale_completed'
      end,
      selected_listing.price,
      jsonb_build_object(
        'title', selected_listing.title,
        'mode', selected_listing.mode,
        'course_or_class', selected_listing.course_or_class
      )
    );

    insert into public.notifications (user_id, title, body, href)
    values
      (
        selected_listing.owner_id,
        'Book handover completed',
        selected_listing.title || ' was confirmed by both parties',
        '/dashboard'
      ),
      (
        selected_request.requester_id,
        'Book handover completed',
        selected_listing.title || ' was confirmed by both parties',
        '/dashboard'
      );
  end if;
end;
$$;

create or replace function public.get_public_trust_summary(p_user_id uuid)
returns table (
  average_rating numeric,
  completed_exchanges integer,
  fulfilled_donations integer
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    profiles.average_rating,
    profiles.completed_exchanges,
    profiles.fulfilled_donations
  from public.profiles
  where profiles.id = p_user_id;
$$;

grant execute on function public.request_book(uuid, text) to authenticated;
grant execute on function public.accept_book_request(uuid) to authenticated;
grant execute on function public.confirm_book_handover(uuid) to authenticated;
grant execute on function public.get_public_trust_summary(uuid) to anon, authenticated;
