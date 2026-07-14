-- Demonstration-only benchmark data. These values are intentionally labeled
-- as demo data in the product and must not be presented as live market prices.
insert into public.price_benchmarks (
  crop,
  variety,
  market_name,
  state,
  unit,
  minimum_price,
  modal_price,
  maximum_price,
  observed_on,
  source_name,
  source_url,
  is_demo
) values
  (
    'Paddy',
    'Fine',
    'Nalgonda Demo Market',
    'Telangana',
    'quintal',
    2200,
    2380,
    2520,
    '2026-07-14',
    'JeevanDwaar demonstration dataset',
    null,
    true
  ),
  (
    'Maize',
    null,
    'Siddipet Demo Market',
    'Telangana',
    'quintal',
    2050,
    2180,
    2290,
    '2026-07-14',
    'JeevanDwaar demonstration dataset',
    null,
    true
  );
