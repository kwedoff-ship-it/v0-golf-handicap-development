-- Create course_reviews table
CREATE TABLE IF NOT EXISTS course_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id UUID NOT NULL UNIQUE REFERENCES rounds(id) ON DELETE CASCADE,
  course_name TEXT NOT NULL,
  difficulty_rating INTEGER NOT NULL CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5),
  weather TEXT NOT NULL,
  overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  review_text TEXT,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on course_name for faster searching
CREATE INDEX IF NOT EXISTS idx_course_reviews_course_name ON course_reviews(course_name);
CREATE INDEX IF NOT EXISTS idx_course_reviews_round_id ON course_reviews(round_id);
CREATE INDEX IF NOT EXISTS idx_course_reviews_user_id ON course_reviews(user_id);

-- Enable RLS
ALTER TABLE course_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies (open access for now, matching your rounds/players setup)
CREATE POLICY "Users can view all reviews" ON course_reviews FOR SELECT USING (true);
CREATE POLICY "Users can insert own reviews" ON course_reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own reviews" ON course_reviews FOR UPDATE USING (true);
CREATE POLICY "Users can delete own reviews" ON course_reviews FOR DELETE USING (true);
