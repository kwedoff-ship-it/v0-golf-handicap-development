-- Add user_id column to players table to link with auth.users
ALTER TABLE players ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id column to rounds table to link with auth.users
ALTER TABLE rounds ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS players_user_id_idx ON players(user_id);
CREATE INDEX IF NOT EXISTS rounds_user_id_idx ON rounds(user_id);

-- Update RLS policies for players table
DROP POLICY IF EXISTS "Allow all operations on players" ON players;

-- Allow users to view their own players and guest players (where user_id is null)
CREATE POLICY "Users can view own and guest players" ON players
  FOR SELECT
  USING (user_id = auth.uid() OR user_id IS NULL);

-- Allow users to insert their own players
CREATE POLICY "Users can insert own players" ON players
  FOR INSERT
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- Allow users to update their own players
CREATE POLICY "Users can update own players" ON players
  FOR UPDATE
  USING (user_id = auth.uid() OR user_id IS NULL);

-- Allow users to delete their own players
CREATE POLICY "Users can delete own players" ON players
  FOR DELETE
  USING (user_id = auth.uid() OR user_id IS NULL);

-- Update RLS policies for rounds table
DROP POLICY IF EXISTS "Allow all operations on rounds" ON rounds;

-- Allow users to view their own rounds and guest rounds
CREATE POLICY "Users can view own and guest rounds" ON rounds
  FOR SELECT
  USING (user_id = auth.uid() OR user_id IS NULL);

-- Allow users to insert their own rounds
CREATE POLICY "Users can insert own rounds" ON rounds
  FOR INSERT
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- Allow users to update their own rounds
CREATE POLICY "Users can update own rounds" ON rounds
  FOR UPDATE
  USING (user_id = auth.uid() OR user_id IS NULL);

-- Allow users to delete their own rounds
CREATE POLICY "Users can delete own rounds" ON rounds
  FOR DELETE
  USING (user_id = auth.uid() OR user_id IS NULL);
