CREATE TABLE public.xero_credentials (
    id UUID PRIMARY KEY REFERENCES public.company(id) ON DELETE CASCADE,
    access_token UUID NOT NULL,
    refresh_token UUID NOT NULL,
    tenant_id UUID NOT NULL
);
