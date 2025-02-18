CREATE TABLE public.carbon_offset (
    id SERIAL PRIMARY KEY,
    carbon_amount_kg INT NOT NULL,
    company_id UUID NOT NULL REFERENCES public.company(id),
    source VARCHAR(255) NOT NULL,
    purchase_date DATE NOT NULL
);
