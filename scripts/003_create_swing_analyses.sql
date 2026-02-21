-- Swing Analyses table for comparing professional and personal golf swings
CREATE TABLE IF NOT EXISTS public.swing_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  pro_video_url TEXT,
  personal_video_url TEXT,
  pro_player_name TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.swing_analyses ENABLE ROW LEVEL SECURITY;

-- RLS Policies: users can only manage their own analyses
CREATE POLICY "Users can view own swing analyses"
  ON public.swing_analyses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own swing analyses"
  ON public.swing_analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own swing analyses"
  ON public.swing_analyses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own swing analyses"
  ON public.swing_analyses FOR DELETE
  USING (auth.uid() = user_id);
