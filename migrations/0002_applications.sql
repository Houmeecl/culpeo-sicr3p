-- Membership applications captured from the public inscripción funnel.
-- Rows are unowned (no user_id): this is an institutional inbox, not per-visitor accounts.
create table if not exists applications (
  id serial primary key,
  folio text not null unique,
  company_name text not null,
  rut text not null,
  sector text not null,
  commune text not null,
  workers text not null,
  contact_name text not null,
  contact_role text not null,
  email text not null,
  phone text not null,
  status text not null default 'pending',
  payment_method text,
  paid_at timestamptz,
  amount_clp integer not null default 120000,
  created_at timestamptz not null default now()
);

create unique index if not exists applications_folio_idx on applications (folio);
create index if not exists applications_created_at_idx on applications (created_at desc);
create index if not exists applications_status_idx on applications (status);
