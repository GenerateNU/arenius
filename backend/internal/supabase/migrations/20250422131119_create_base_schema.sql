CREATE EXTENSION IF NOT EXISTS moddatetime SCHEMA "extensions";

create table public.emission_factor (
  id text not null,
  activity_id text not null,
  name text not null,
  description text null,
  unit text not null,
  unit_type text not null,
  year integer not null,
  region text not null,
  category text not null,
  source text not null,
  source_dataset text null,
  constraint emission_factor_pkey primary key (id),
  constraint unique_activity_id unique (activity_id)
) TABLESPACE pg_default;

create table public.company (
  id uuid not null,
  name text not null,
  xero_tenant_id uuid null,
  last_transaction_import_time timestamp with time zone null,
  last_contact_import_time timestamp with time zone null,
  constraint company_pkey primary key (id)
) TABLESPACE pg_default;

create table public.company_favorite (
  company_id uuid not null,
  emissions_factor_id text not null,
  date timestamp with time zone null,
  constraint unique_company_emission_factor_pair unique (company_id, emissions_factor_id),
  constraint company_favorite_company_id_fkey foreign KEY (company_id) references company (id),
  constraint company_favorite_emissions_factor_id_fkey foreign KEY (emissions_factor_id) references emission_factor (id)
) TABLESPACE pg_default;

create table public.contact (
  id uuid not null,
  xero_contact_id uuid null,
  name text not null,
  email text null,
  phone text null,
  city text null,
  state text null,
  company_id uuid null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  client_overview text null,
  notes text null,
  constraint contact_pkey primary key (id),
  constraint unique_xero_contact_id unique (xero_contact_id),
  constraint contact_company_id_fkey foreign KEY (company_id) references company (id)
) TABLESPACE pg_default;

create trigger handle_updated_at BEFORE
update on contact for EACH row
execute FUNCTION extensions.moddatetime ('updated_at');

create table public.line_item (
  id uuid not null,
  xero_line_item_id uuid null,
  description text not null,
  total_amount double precision not null,
  company_id uuid not null,
  contact_id uuid not null,
  date timestamp without time zone not null,
  currency_code text not null,
  emission_factor_id text null,
  co2 double precision null,
  scope integer null,
  co2_unit text null,
  recommended_scope integer null,
  recommended_emission_factor_id text null,
  constraint line_item_pkey primary key (id),
  constraint unique_xero_line_item_id unique (xero_line_item_id),
  constraint fk_emissionsid foreign KEY (emission_factor_id) references emission_factor (activity_id) on delete CASCADE,
  constraint line_item_company_id_fkey foreign KEY (company_id) references company (id)
) TABLESPACE pg_default;

create table public."transaction" (
  company_id uuid not null,
  bank_transaction_id uuid not null,
  contact_id integer not null,
  sub_total numeric(20, 2) not null,
  total_tax numeric(20, 2) not null,
  total numeric(20, 2) not null,
  currency_code text not null,
  created_at timestamp with time zone not null,
  imported_at timestamp with time zone not null,
  constraint transaction_pkey primary key (company_id, bank_transaction_id)
) TABLESPACE pg_default;

create table public.user_creds (
  id uuid not null,
  first_name text null,
  last_name text null,
  company_id uuid null,
  refresh_token text null,
  tenant_id uuid null,
  city character varying(100) null,
  state character varying(100) null,
  photo_url text null,
  constraint user_creds_pkey primary key (id),
  constraint user_creds_company_id_fkey foreign KEY (company_id) references company (id),
  constraint user_creds_user_id_fkey foreign KEY (id) references auth.users (id)
) TABLESPACE pg_default;