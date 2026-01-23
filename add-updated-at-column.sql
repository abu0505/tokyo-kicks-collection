-- Add updated_at column to shoes table
ALTER TABLE public.shoes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create or replace the function to update the timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists to avoid errors on re-run
DROP TRIGGER IF EXISTS set_updated_at ON public.shoes;

-- Create the trigger
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.shoes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
