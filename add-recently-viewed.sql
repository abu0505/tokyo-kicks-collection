-- Create recently_viewed table
CREATE TABLE IF NOT EXISTS recently_viewed (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    shoe_id UUID REFERENCES shoes(id) ON DELETE CASCADE NOT NULL,
    viewed_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, shoe_id)
);

-- Enable RLS
ALTER TABLE recently_viewed ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own recently viewed items"
ON recently_viewed FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recently viewed items"
ON recently_viewed FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recently viewed items"
ON recently_viewed FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recently viewed items"
ON recently_viewed FOR DELETE
USING (auth.uid() = user_id);
