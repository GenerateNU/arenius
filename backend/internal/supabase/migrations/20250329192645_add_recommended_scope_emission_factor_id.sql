ALTER TABLE line_item
ADD COLUMN recommended_scope INTEGER;

ALTER TABLE line_item
ADD COLUMN recommended_emission_factor_id TEXT;
