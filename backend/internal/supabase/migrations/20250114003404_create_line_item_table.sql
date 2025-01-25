create table line_item (
    id uuid not null primary key,
    xero_line_item_id uuid,
    description text not null,
    quantity float not null,
    unit_amount float not null,
    company_id uuid not null,
    contact_id uuid not null,
    date timestamp not null,
    currency_code text not null,

    emission_factor text,
    amount float,
    unit text,
    co2 float,
    scope int,

    foreign key (company_id) references company(id)
);