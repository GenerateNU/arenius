ALTER TABLE line_item DROP COLUMN quantity;

ALTER TABLE line_item RENAME COLUMN unit_amount TO total_amount;