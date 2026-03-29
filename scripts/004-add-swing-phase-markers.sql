-- Add columns to store swing phase markers for pro and personal videos
-- These store JSON arrays of phase timestamps detected by AI or marked manually

ALTER TABLE swing_analyses 
ADD COLUMN IF NOT EXISTS pro_phases JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS personal_phases JSONB DEFAULT '[]';

-- Add comment explaining the structure
COMMENT ON COLUMN swing_analyses.pro_phases IS 'JSON array of phase timestamps for pro video: [{phaseId, label, timestamp, confidence}]';
COMMENT ON COLUMN swing_analyses.personal_phases IS 'JSON array of phase timestamps for personal video: [{phaseId, label, timestamp, confidence}]';
