ALTER TABLE contact
ADD COLUMN created_at timestamptz default now(),
ADD COLUMN updated_at timestamptz default now();

create extension if not exists moddatetime schema extensions;

create trigger handle_updated_at before update on contact
  for each row execute procedure moddatetime (updated_at);