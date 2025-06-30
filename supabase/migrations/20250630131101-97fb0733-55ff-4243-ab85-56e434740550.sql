
-- Enable RLS on critical tables and create security policies

-- 1. REMEDIES TABLE - Enable RLS and create policies
ALTER TABLE public.remedies ENABLE ROW LEVEL SECURITY;

-- Allow public read access to published remedies
CREATE POLICY "Public can view published remedies" 
ON public.remedies 
FOR SELECT 
USING (status = 'published');

-- Allow authenticated users to create remedies
CREATE POLICY "Authenticated users can create remedies" 
ON public.remedies 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Allow users to update their own remedies (via expert_remedies relationship)
CREATE POLICY "Users can update their own remedies" 
ON public.remedies 
FOR UPDATE 
TO authenticated 
USING (
  id IN (
    SELECT remedy_id 
    FROM expert_remedies 
    WHERE expert_id IN (
      SELECT id 
      FROM experts 
      WHERE id = auth.uid()
    )
  )
);

-- Allow admins to manage all remedies
CREATE POLICY "Admins can manage all remedies" 
ON public.remedies 
FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 
    FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  )
);

-- 2. COMMENTS TABLE - Enable RLS and create policies
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Allow public read access to approved comments
CREATE POLICY "Public can view approved comments" 
ON public.comments 
FOR SELECT 
USING (status = 'approved');

-- Allow authenticated users to create comments
CREATE POLICY "Authenticated users can create comments" 
ON public.comments 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own comments
CREATE POLICY "Users can update their own comments" 
ON public.comments 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

-- Allow admins to manage all comments
CREATE POLICY "Admins can manage all comments" 
ON public.comments 
FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 
    FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  )
);

-- 3. ADMIN_LOGS TABLE - Enable RLS and restrict to admins only
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can access admin logs
CREATE POLICY "Only admins can access admin logs" 
ON public.admin_logs 
FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 
    FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  )
);

-- 4. NEWS_ARTICLES TABLE - Enable RLS and create policies
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;

-- Allow public read access to published articles
CREATE POLICY "Public can view published articles" 
ON public.news_articles 
FOR SELECT 
USING (status = 'published');

-- Allow admins to manage all articles
CREATE POLICY "Admins can manage all articles" 
ON public.news_articles 
FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 
    FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  )
);

-- 5. SHOPPING_ITEMS TABLE - Enable RLS and create policies
ALTER TABLE public.shopping_items ENABLE ROW LEVEL SECURITY;

-- Allow public read access to shopping items
CREATE POLICY "Public can view shopping items" 
ON public.shopping_items 
FOR SELECT 
USING (true);

-- Allow admins to manage shopping items
CREATE POLICY "Admins can manage shopping items" 
ON public.shopping_items 
FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 
    FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  )
);
