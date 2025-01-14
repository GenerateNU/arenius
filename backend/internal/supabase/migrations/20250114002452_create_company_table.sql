create table company (
    id uuid not null,
    name text not null,
    xero_tenant_id uuid,
    last_import_time datetime
);