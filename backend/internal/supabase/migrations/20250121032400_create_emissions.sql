Create Table emission_factor (
    id text PRIMARY KEY,
    activity_id text NOT NULL,
    name text NOT NULL,
    description text,
    unit text NOT NULL,
    unit_type text NOT NULL,
    year integer NOT NULL,
    region text NOT NULL,
    category text NOT NULL,
    source text NOT NULL,
    source_dataset text
);

-- Rename the column emission_factor to EmissionsID
ALTER TABLE line_item
RENAME COLUMN emission_factor TO emissions_factor_id;

-- Add a foreign key constraint to link EmissionsID to the emissions table
ALTER TABLE line_item
ADD CONSTRAINT fk_emissionsid
FOREIGN KEY (emissions_factor_id) REFERENCES emission_factor(id);