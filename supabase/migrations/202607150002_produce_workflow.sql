-- Day 3: guarded farmer-to-buyer bidding, offer acceptance and mutual pickup
-- confirmation.

alter table public.produce_listings
  add column farmer_confirmed_at timestamptz,
  add column buyer_confirmed_at timestamptz;

create policy "Produce bids visible to participants"
  on public.produce_bids for select using (
    auth.uid() = buyer_id
    or exists (
      select 1 from public.produce_listings
      where produce_listings.id = produce_bids.listing_id
        and produce_listings.farmer_id = auth.uid()
    )
  );

create policy "Buyers bid on open produce"
  on public.produce_bids for insert with check (
    auth.uid() = buyer_id
    and exists (
      select 1 from public.produce_listings
      where produce_listings.id = produce_bids.listing_id
        and produce_listings.status = 'open'
        and produce_listings.farmer_id <> auth.uid()
        and produce_bids.quantity <= produce_listings.quantity
    )
  );

create or replace function public.place_produce_bid(
  p_listing_id uuid,
  p_quantity numeric,
  p_price_per_unit numeric,
  p_pickup_date date,
  p_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  selected_listing public.produce_listings%rowtype;
  saved_bid_id uuid;
begin
  select * into selected_listing
  from public.produce_listings
  where id = p_listing_id
  for update;

  if not found then
    raise exception 'Produce listing not found';
  end if;

  if selected_listing.status <> 'open' then
    raise exception 'This produce listing is no longer open';
  end if;

  if selected_listing.farmer_id = auth.uid() then
    raise exception 'A farmer cannot bid on their own listing';
  end if;

  if p_quantity <= 0 or p_quantity > selected_listing.quantity then
    raise exception 'Bid quantity must be within the listed quantity';
  end if;

  if p_price_per_unit <= 0 then
    raise exception 'Bid price must be positive';
  end if;

  if p_pickup_date < current_date then
    raise exception 'Pickup date cannot be in the past';
  end if;

  insert into public.produce_bids (
    listing_id,
    buyer_id,
    quantity,
    price_per_unit,
    pickup_date,
    notes,
    status
  ) values (
    p_listing_id,
    auth.uid(),
    p_quantity,
    p_price_per_unit,
    p_pickup_date,
    p_notes,
    'pending'
  )
  on conflict (listing_id, buyer_id)
  do update set
    quantity = excluded.quantity,
    price_per_unit = excluded.price_per_unit,
    pickup_date = excluded.pickup_date,
    notes = excluded.notes,
    status = 'pending'
  returning id into saved_bid_id;

  insert into public.notifications (user_id, title, body, href)
  values (
    selected_listing.farmer_id,
    'New produce offer',
    'A buyer submitted an offer for ' || selected_listing.crop,
    '/produce'
  );

  return saved_bid_id;
end;
$$;

create or replace function public.accept_produce_bid(p_bid_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  selected_bid public.produce_bids%rowtype;
  selected_listing public.produce_listings%rowtype;
begin
  select * into selected_bid
  from public.produce_bids
  where id = p_bid_id
  for update;

  if not found then
    raise exception 'Produce bid not found';
  end if;

  select * into selected_listing
  from public.produce_listings
  where id = selected_bid.listing_id
  for update;

  if selected_listing.farmer_id <> auth.uid() then
    raise exception 'Only the farmer can accept a produce offer';
  end if;

  if selected_listing.status <> 'open' or selected_bid.status <> 'pending' then
    raise exception 'This offer can no longer be accepted';
  end if;

  update public.produce_bids
  set status = case
    when id = p_bid_id then 'accepted'::public.application_status
    else 'rejected'::public.application_status
  end
  where listing_id = selected_listing.id and status = 'pending';

  update public.produce_listings
  set
    status = 'reserved',
    accepted_bid_id = p_bid_id,
    farmer_confirmed_at = null,
    buyer_confirmed_at = null,
    updated_at = now()
  where id = selected_listing.id;

  insert into public.notifications (user_id, title, body, href)
  values (
    selected_bid.buyer_id,
    'Produce offer accepted',
    'Your offer for ' || selected_listing.crop || ' was accepted',
    '/produce'
  );
end;
$$;

create or replace function public.confirm_produce_pickup(p_listing_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  selected_listing public.produce_listings%rowtype;
  accepted_bid public.produce_bids%rowtype;
  updated_listing public.produce_listings%rowtype;
begin
  select * into selected_listing
  from public.produce_listings
  where id = p_listing_id
  for update;

  if not found or selected_listing.status <> 'reserved' then
    raise exception 'Reserved produce listing not found';
  end if;

  select * into accepted_bid
  from public.produce_bids
  where id = selected_listing.accepted_bid_id;

  if auth.uid() = selected_listing.farmer_id then
    update public.produce_listings
    set farmer_confirmed_at = coalesce(farmer_confirmed_at, now())
    where id = p_listing_id
    returning * into updated_listing;
  elsif auth.uid() = accepted_bid.buyer_id then
    update public.produce_listings
    set buyer_confirmed_at = coalesce(buyer_confirmed_at, now())
    where id = p_listing_id
    returning * into updated_listing;
  else
    raise exception 'Only the farmer or accepted buyer can confirm pickup';
  end if;

  if updated_listing.farmer_confirmed_at is not null
     and updated_listing.buyer_confirmed_at is not null then
    update public.produce_listings
    set status = 'completed', updated_at = now()
    where id = p_listing_id;

    insert into public.activity_records (
      actor_id,
      counterparty_id,
      domain,
      subject_id,
      event_type,
      amount,
      details
    ) values (
      selected_listing.farmer_id,
      accepted_bid.buyer_id,
      'produce',
      selected_listing.id,
      'produce_pickup_completed',
      accepted_bid.quantity * accepted_bid.price_per_unit,
      jsonb_build_object(
        'crop', selected_listing.crop,
        'quantity', accepted_bid.quantity,
        'unit', selected_listing.unit,
        'price_per_unit', accepted_bid.price_per_unit
      )
    );

    insert into public.notifications (user_id, title, body, href)
    values
      (
        selected_listing.farmer_id,
        'Produce exchange completed',
        selected_listing.crop || ' pickup was confirmed by both parties',
        '/dashboard'
      ),
      (
        accepted_bid.buyer_id,
        'Produce exchange completed',
        selected_listing.crop || ' pickup was confirmed by both parties',
        '/dashboard'
      );
  end if;
end;
$$;

grant execute on function public.place_produce_bid(uuid, numeric, numeric, date, text) to authenticated;
grant execute on function public.accept_produce_bid(uuid) to authenticated;
grant execute on function public.confirm_produce_pickup(uuid) to authenticated;
