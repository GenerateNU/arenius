create table line_item (
    id uuid not null primary key,
    xero_contact_id uuid,
    name text not null,
    email text not null,
    phone text not null,
    city text not null,
    state text not null,
    company_id uuid not null,

    foreign key (company_id) references company(id)
);