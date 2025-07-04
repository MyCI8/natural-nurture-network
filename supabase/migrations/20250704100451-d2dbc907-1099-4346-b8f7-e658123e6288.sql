-- First, let's add missing indexes for performance optimization
-- These are critical for frequently queried columns

-- Index for remedies search and filtering
CREATE INDEX IF NOT EXISTS idx_remedies_status ON remedies(status);
CREATE INDEX IF NOT EXISTS idx_remedies_symptoms ON remedies USING GIN(symptoms);
CREATE INDEX IF NOT EXISTS idx_remedies_expert_recommendations ON remedies USING GIN(expert_recommendations);
CREATE INDEX IF NOT EXISTS idx_remedies_created_at ON remedies(created_at DESC);

-- Index for videos performance
CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status);
CREATE INDEX IF NOT EXISTS idx_videos_creator_id ON videos(creator_id);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_videos_show_in_latest ON videos(show_in_latest) WHERE show_in_latest = true;

-- Index for news articles
CREATE INDEX IF NOT EXISTS idx_news_articles_status ON news_articles(status);
CREATE INDEX IF NOT EXISTS idx_news_articles_published_at ON news_articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_articles_slug ON news_articles(slug);

-- Index for experts
CREATE INDEX IF NOT EXISTS idx_experts_field_of_expertise ON experts(field_of_expertise);
CREATE INDEX IF NOT EXISTS idx_experts_full_name ON experts(full_name);

-- Index for user roles (critical for RLS performance)
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- Index for comments and interactions
CREATE INDEX IF NOT EXISTS idx_comments_remedy_id ON comments(remedy_id);
CREATE INDEX IF NOT EXISTS idx_comments_status ON comments(status);
CREATE INDEX IF NOT EXISTS idx_video_comments_video_id ON video_comments(video_id);
CREATE INDEX IF NOT EXISTS idx_video_likes_video_id ON video_likes(video_id);
CREATE INDEX IF NOT EXISTS idx_remedy_likes_remedy_id ON remedy_likes(remedy_id);

-- Optimize RLS policies for better performance
-- Create optimized function for admin check
CREATE OR REPLACE FUNCTION public.is_admin_optimized()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  );
$$;

-- Update critical RLS policies for consistency
-- Fix ingredients table (currently has no RLS)
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published ingredients" ON ingredients
FOR SELECT USING (status = 'published' OR status IS NULL);

CREATE POLICY "Admins can manage ingredients" ON ingredients
FOR ALL USING (is_admin_optimized());

-- Fix expert_remedies table (currently has no RLS)
ALTER TABLE expert_remedies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view expert remedies" ON expert_remedies
FOR SELECT USING (true);

CREATE POLICY "Admins can manage expert remedies" ON expert_remedies
FOR ALL USING (is_admin_optimized());

-- Add missing RLS to news_article_links
ALTER TABLE news_article_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view article links" ON news_article_links
FOR SELECT USING (true);

CREATE POLICY "Admins can manage article links" ON news_article_links
FOR ALL USING (is_admin_optimized());