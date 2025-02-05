ALTER TABLE line_item
ADD CONSTRAINT unique_xero_line_item_id UNIQUE (xero_line_item_id);