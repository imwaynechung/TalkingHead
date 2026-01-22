/*
  # Create profiles table for TalkingHead avatar settings
  
  1. New Tables
    - `profiles`
      - `id` (uuid, primary key) - Unique identifier for each profile
      - `name` (text) - Profile name
      - `voice` (text) - Selected voice index
      - `rate` (numeric) - Speech rate (0.5-2.0)
      - `pitch` (numeric) - Speech pitch (0-2.0)
      - `volume` (numeric) - Speech volume (0-1.0)
      - `eyeContact` (numeric) - Eye contact level (0-1.0)
      - `headMove` (numeric) - Head movement level (0-1.0)
      - `mute` (boolean) - Whether avatar is muted
      - `created_at` (timestamptz) - Profile creation timestamp
  
  2. Security
    - Enable RLS on `profiles` table
    - Add policy for public read access (demo purposes)
    - Add policy for public insert access (demo purposes)
    - Add policy for public delete access (demo purposes)
    
  Note: In production, these policies should be restricted to authenticated users only.
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  voice text DEFAULT '0',
  rate numeric DEFAULT 1.0,
  pitch numeric DEFAULT 1.0,
  volume numeric DEFAULT 1.0,
  "eyeContact" numeric DEFAULT 0.5,
  "headMove" numeric DEFAULT 0.5,
  mute boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to profiles"
  ON profiles
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access to profiles"
  ON profiles
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to profiles"
  ON profiles
  FOR DELETE
  TO public
  USING (true);

CREATE POLICY "Allow public update access to profiles"
  ON profiles
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);
