
-- Create link_previews_cache table for caching preview data
CREATE TABLE IF NOT EXISTS link_previews_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL UNIQUE,
  title text,
  description text,
  thumbnail_url text,
  price numeric,
  success boolean DEFAULT false,
  error_message text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  expires_at timestamp with time zone DEFAULT (timezone('utc'::text, now()) + interval '24 hours')
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_link_previews_cache_url ON link_previews_cache(url);
CREATE INDEX IF NOT EXISTS idx_link_previews_cache_expires_at ON link_previews_cache(expires_at);

-- Add RLS policies
ALTER TABLE link_previews_cache ENABLE ROW LEVEL SECURITY;

-- Allow read access to all authenticated users
CREATE POLICY "Allow read access to link previews cache" ON link_previews_cache
  FOR SELECT USING (true);

-- Allow insert/update access to all authenticated users (for caching)
CREATE POLICY "Allow insert/update access to link previews cache" ON link_previews_cache
  FOR ALL USING (true);
