DELETE FROM line_item;

DELETE FROM company;

INSERT INTO company (id, name, xero_tenant_id, last_import_time)
VALUES
    ('d2a4f6d4-8f59-4b2b-a59d-7a3ff633cf9f', 'Acme Corp', '2a7b5b84-4e28-45a9-b38f-8d4a28e20638', '2025-01-10 12:34:56'),
    ('0a67f5d3-88b6-4e8f-aac0-5137b29917fd', 'Beta Solutions', 'd1c9f519-123f-4b34-820b-c9d5dffde6ea', '2025-01-09 09:22:15'),
    ('5e30b08e-bd5f-4b64-a3b2-40758b4dfca7', 'Gamma Enterprises', NULL, NULL),
    ('de3cb272-7557-4b57-bb0e-221f10f240f8', 'Delta Innovations', 'bd3b9f43-1dfe-4732-93f6-b274d850e493', '2025-01-11 14:15:23');

INSERT INTO emission_factor (
    id, activity_id, name, description, unit, unit_type, year, region, category, source, source_dataset
) VALUES
    ('1', 'electricity-generation', 'Electricity Generation', 'Electricity generation from coal', 'kgCO2e', 'mass', 2023, 'North America', 'Energy', 'EPA', 'EPA 2023 Dataset'),
    ('2', 'passenger-vehicles', 'Transportation', 'Passenger vehicles', 'gCO2e/km', 'distance', 2023, 'Europe', 'Transport', 'EU Commission', 'EU 2023 Dataset'),
    ('3', 'cement-production', 'Industrial Processes', 'Cement production', 'kgCO2e', 'mass', 2023, 'Asia', 'Industry', 'UNFCCC', 'UNFCCC 2023 Dataset'),
    ('4', 'rice-cultivation', 'Agriculture', 'Rice cultivation', 'kgCH4', 'mass', 2023, 'South America', 'Agriculture', 'FAO', 'FAO 2023 Dataset'),
    ('5', 'waste-management', 'Waste Management', 'Landfill', 'kgCO2e', 'mass', 2023, 'Africa', 'Waste', 'IPCC', 'IPCC 2023 Dataset');

INSERT INTO line_item (id, xero_line_item_id, description, quantity, unit_amount, company_id, contact_id, date, currency_code, emission_factor_id, co2, scope)
VALUES
    ('d2a4f6d4-8f59-4b2b-a59d-7a3ff633cf9f', 'd2a4f6d4-8f59-4b2b-a59d-7a3ff633cf9f', 'Product A', 5, 200.00, 'd2a4f6d4-8f59-4b2b-a59d-7a3ff633cf9f', '11111111-1111-1111-1111-111111111111', '2025-01-10 12:34:56', 'USD', 'electricity-generation', 50.0, 1),
    ('0a67f5d3-88b6-4e8f-aac0-5137b29917fd', '0a67f5d3-88b6-4e8f-aac0-5137b29917fd', 'Product B', 10, 150.00, '0a67f5d3-88b6-4e8f-aac0-5137b29917fd', '33333333-3333-3333-3333-333333333333', '2025-01-09 09:22:15', 'USD', 'electricity-generation', 75.0, 2),
    ('5e30b08e-bd5f-4b64-a3b2-40758b4dfca7', '5e30b08e-bd5f-4b64-a3b2-40758b4dfca7', 'Service C', 3, 500.00, '5e30b08e-bd5f-4b64-a3b2-40758b4dfca7', '55555555-5555-5555-5555-555555555555', '2025-01-12 14:15:23', 'USD', 'passenger-vehicles', 30.0, 3),
    ('de3cb272-7557-4b57-bb0e-221f10f240f8', 'de3cb272-7557-4b57-bb0e-221f10f240f8', 'Product D', 7, 250.00, 'de3cb272-7557-4b57-bb0e-221f10f240f8', '66666666-6666-6666-6666-666666666666', '2025-01-11 16:18:00', 'USD', 'passenger-vehicles', 90.0, 1);

INSERT INTO line_item (
    id, xero_line_item_id, description, quantity, unit_amount, company_id, contact_id, date, currency_code, emission_factor_id, scope
) VALUES 
(
    '1a2b3c4d-1234-5678-9101-abcdefabcdef', 
    '1a2b3c4d-1234-5678-9101-abcdefabcdef', 
    'Office Supplies', 
    10, 
    15.5, 
    'd2a4f6d4-8f59-4b2b-a59d-7a3ff633cf9f', 
    '1a2b3c4d-1234-5678-9101-abcdefabcdef', 
    '2025-01-01T00:00:00Z', 
    'USD', 
    'passenger-vehicles', 
    1
);

INSERT INTO line_item (
    id, xero_line_item_id, description, quantity, unit_amount, company_id, contact_id, date, currency_code, 
    emission_factor_id, scope
) VALUES 
(
    '2b3c4d5e-2345-6789-0123-fedcbafedcba', 
    NULL, 
    'Travel Expenses', 
    3, 
    200.0, 
    'd2a4f6d4-8f59-4b2b-a59d-7a3ff633cf9f', 
    '2b3c4d5e-2345-6789-0123-fedcbafedcba', 
    '2025-01-05T00:00:00Z', 
    'EUR', 
    'electricity-generation', 
    3
);