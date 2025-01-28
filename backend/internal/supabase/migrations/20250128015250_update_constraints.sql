ALTER TABLE line_item DROP CONSTRAINT fk_emissionsid;

ALTER TABLE emission_factor ADD CONSTRAINT unique_activity_id UNIQUE (activity_id);

ALTER TABLE line_item ADD CONSTRAINT fk_emissionsid FOREIGN KEY (emission_factor_id) REFERENCES emission_factor(activity_id) ON DELETE CASCADE;