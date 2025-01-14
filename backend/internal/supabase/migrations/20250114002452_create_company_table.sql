create table company (
    id uuid not null primary key,
    name text not null,
    xero_tenant_id uuid,
    last_import_time timestamp with time zone
);