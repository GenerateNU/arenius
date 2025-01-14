DELETE FROM line_item;

DELETE FROM transaction;

DELETE FROM company;

INSERT INTO transaction (company_id, bank_transaction_id, contact_id, sub_total, total_tax, total, currency_code, created_at, imported_at)
VALUES
    ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 1, 1000.00, 100.00, 1100.00, 'USD', '2023-10-10T14:48:00Z', '2023-10-10T14:48:00Z'),
    ('33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 2, 2000.00, 200.00, 2200.00, 'USD', '2023-10-11T14:48:00Z', '2023-10-11T14:48:00Z'),
    ('55555555-5555-5555-5555-555555555555', '66666666-6666-6666-6666-666666666666', 3, 3000.00, 300.00, 3300.00, 'USD', '2023-10-12T14:48:00Z', '2023-10-12T14:48:00Z');

INSERT INTO company (id, name, xero_tenant_id, last_import_time)
VALUES
    ('d2a4f6d4-8f59-4b2b-a59d-7a3ff633cf9f', 'Acme Corp', '2a7b5b84-4e28-45a9-b38f-8d4a28e20638', '2025-01-10 12:34:56'),
    ('0a67f5d3-88b6-4e8f-aac0-5137b29917fd', 'Beta Solutions', 'd1c9f519-123f-4b34-820b-c9d5dffde6ea', '2025-01-09 09:22:15'),
    ('5e30b08e-bd5f-4b64-a3b2-40758b4dfca7', 'Gamma Enterprises', NULL, NULL),
    ('de3cb272-7557-4b57-bb0e-221f10f240f8', 'Delta Innovations', 'bd3b9f43-1dfe-4732-93f6-b274d850e493', '2025-01-11 14:15:23');

INSERT INTO line_item (id, xero_line_item_id, description, quantity, unit_amount, company_id, contact_id, date, currency_code, emission_factor, amount, unit, co2, scope)
VALUES
    (1, 'd2a4f6d4-8f59-4b2b-a59d-7a3ff633cf9f', 'Product A', 5, 200.00, 'd2a4f6d4-8f59-4b2b-a59d-7a3ff633cf9f', '11111111-1111-1111-1111-111111111111', '2025-01-10 12:34:56', 'USD', 'factor_A', 1000.00, 'kg', 50.0, 1),
    (2, '0a67f5d3-88b6-4e8f-aac0-5137b29917fd', 'Product B', 10, 150.00, '0a67f5d3-88b6-4e8f-aac0-5137b29917fd', '33333333-3333-3333-3333-333333333333', '2025-01-09 09:22:15', 'USD', 'factor_B', 1500.00, 'kg', 75.0, 2),
    (3, '5e30b08e-bd5f-4b64-a3b2-40758b4dfca7', 'Service C', 3, 500.00, '5e30b08e-bd5f-4b64-a3b2-40758b4dfca7', '55555555-5555-5555-5555-555555555555', '2025-01-12 14:15:23', 'USD', 'factor_C', 1500.00, 'hours', 30.0, 3),
    (4, 'de3cb272-7557-4b57-bb0e-221f10f240f8', 'Product D', 7, 250.00, 'de3cb272-7557-4b57-bb0e-221f10f240f8', '66666666-6666-6666-6666-666666666666', '2025-01-11 16:18:00', 'USD', 'factor_D', 1750.00, 'kg', 90.0, 1);
