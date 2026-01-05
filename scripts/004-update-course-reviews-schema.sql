-- Make round_id nullable so reviews can be standalone
ALTER TABLE course_reviews 
  ALTER COLUMN round_id DROP NOT NULL,
  DROP CONSTRAINT IF EXISTS course_reviews_round_id_key;

-- Update the unique constraint - if a round has an ID, it can only have one review
-- But NULL round_ids are allowed multiple times
CREATE UNIQUE INDEX IF NOT EXISTS unique_round_review 
  ON course_reviews (round_id) 
  WHERE round_id IS NOT NULL;
