create table transaction (
    company_id uuid not null,
    bank_transaction_id uuid not null,
    contact_id int not null,
    sub_total numeric(20, 2) not null,
    total_tax numeric(20, 2) not null,
    total numeric(20, 2) not null,
    currency_code text not null,
    created_at timestamp with time zone not null,
    imported_at timestamp with time zone not null,
    primary key (company_id, bank_transaction_id)
);