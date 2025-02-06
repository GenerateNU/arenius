CREATE TABLE public.xero_credentials (
    cred_id SERIAL PRIMARY KEY,                  
    company_id UUID NOT NULL REFERENCES public.company(id), 
    access_token UUID NOT NULL,  
    refresh_token UUID NOT NULL, 
    tenant_id UUID NOT NULL 
);