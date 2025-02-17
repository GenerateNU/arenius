ALTER TABLE company
RENAME COLUMN last_import_time TO last_transaction_import_time;

ALTER TABLE company
ADD COLUMN last_contact_import_time TIMESTAMP WITH TIME ZONE;
