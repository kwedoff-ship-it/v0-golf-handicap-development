-- Create players table
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  favorite_course TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rounds table
CREATE TABLE IF NOT EXISTS rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  course TEXT NOT NULL,
  tee TEXT NOT NULL,
  rating DECIMAL(4,1) NOT NULL,
  slope INTEGER NOT NULL CHECK (slope >= 55 AND slope <= 155),
  score INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_rounds_player_id ON rounds(player_id);
CREATE INDEX IF NOT EXISTS idx_rounds_date ON rounds(date DESC);

-- Enable Row Level Security
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (you can restrict these later based on your auth needs)
CREATE POLICY "Allow all operations on players" ON players
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on rounds" ON rounds
  FOR ALL USING (true) WITH CHECK (true);
