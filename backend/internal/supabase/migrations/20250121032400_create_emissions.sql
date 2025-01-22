Create Table emission_factor (
    activity_id text PRIMARY KEY,
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

ALTER TABLE line_item
ADD CONSTRAINT fk_emission_factor
FOREIGN KEY (emission_factor)
REFERENCES emission_factor(activity_id);