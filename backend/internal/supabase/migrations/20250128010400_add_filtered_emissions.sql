CREATE VIEW emission_factors_filtered as
  WITH latest_emission AS (
    SELECT activity_id, name, description, year, category,
           ROW_NUMBER() OVER (PARTITION BY activity_id ORDER BY year DESC) AS rn
    FROM emission_factor
    WHERE region = 'US' AND unit_type = 'Money'
)
    SELECT category, name, description, activity_id, year
    FROM latest_emission
    WHERE rn = 1
    ORDER BY category;