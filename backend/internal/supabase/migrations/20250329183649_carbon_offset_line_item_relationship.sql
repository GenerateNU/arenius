ALTER TABLE carbon_offset ADD COLUMN line_item_id UUID;

ALTER TABLE carbon_offset
ADD CONSTRAINT fk_carbon_offset_line_item
FOREIGN KEY (line_item_id) 
REFERENCES line_item(id);