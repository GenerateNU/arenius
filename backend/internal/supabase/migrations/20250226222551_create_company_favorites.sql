create table company_favorite (
    company_id uuid not null,
    emissions_factor_id text not null,
    date timestamp with time zone,
    
    foreign key (company_id) references company(id),
    foreign key (emissions_factor_id) references emission_factor(id)
)