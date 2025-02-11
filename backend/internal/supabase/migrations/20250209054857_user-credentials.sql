CREATE TABLE public.user_credentials (
    user_id UUID NOT NULL REFERENCES auth.users(id),  -- Referencing auth.users(id)
    first_name TEXT NOT NULL,  -- Use TEXT for first name
    last_name TEXT NOT NULL,  -- Use TEXT for last name
    company_id UUID NOT NULL REFERENCES public.company(id),  -- Referencing public.company(id)
    -- access_token TEXT NOT NULL,  -- Use TEXT for access token
    refresh_token TEXT NOT NULL,  -- Use TEXT for refresh token
    tenant_id UUID NOT NULL,  -- UUID for tenant_id
);
