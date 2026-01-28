-- Migration: Re-create saved_addresses table
-- Run this in your Supabase SQL Editor

-- WARNING: This will delete existing saved addresses to ensure the schema is correct
DROP TABLE IF EXISTS saved_addresses CASCADE;

CREATE TABLE saved_addresses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  apartment TEXT,
  city TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  phone TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  last_used TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for faster queries by user
CREATE INDEX idx_saved_addresses_user_id ON saved_addresses(user_id);

-- Create index for sorting by last_used
CREATE INDEX idx_saved_addresses_last_used ON saved_addresses(last_used DESC);

-- Enable Row Level Security
ALTER TABLE saved_addresses ENABLE ROW LEVEL SECURITY;

-- Users can only view their own addresses
CREATE POLICY "Users can view own addresses"
  ON saved_addresses FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own addresses
CREATE POLICY "Users can insert own addresses"
  ON saved_addresses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own addresses
CREATE POLICY "Users can update own addresses"
  ON saved_addresses FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own addresses
CREATE POLICY "Users can delete own addresses"
  ON saved_addresses FOR DELETE
  USING (auth.uid() = user_id);
