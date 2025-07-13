-- Phase 4: Database Cleanup - Remove Legacy Symptom System
-- This migration removes all legacy symptom tables, functions, and types
-- All data has been backed up and system migrated to health_concerns

-- Step 1: Drop symptom tables (CASCADE to remove dependencies)
DROP TABLE IF EXISTS public.symptom_clicks CASCADE;
DROP TABLE IF EXISTS public.symptom_experts CASCADE;
DROP TABLE IF EXISTS public.symptom_related_articles CASCADE;
DROP TABLE IF EXISTS public.symptom_related_links CASCADE;
DROP TABLE IF EXISTS public.symptom_remedies CASCADE;
DROP TABLE IF EXISTS public.symptom_details CASCADE;

-- Step 2: Drop symptom functions
DROP FUNCTION IF EXISTS public.get_symptom_by_id(text);
DROP FUNCTION IF EXISTS public.get_symptom_related_content(symptom_type);
DROP FUNCTION IF EXISTS public.get_top_symptoms(integer);

-- Step 3: Remove symptoms column from remedies table
ALTER TABLE public.remedies DROP COLUMN IF EXISTS symptoms;

-- Step 4: Drop symptom_type enum (this will cascade and remove all references)
DROP TYPE IF EXISTS public.symptom_type CASCADE;

-- Step 5: Update remedies table to ensure it has health_concerns column
-- (This may already exist from previous migrations, but safe to add if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'remedies' 
        AND column_name = 'health_concerns'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.remedies ADD COLUMN health_concerns text[] DEFAULT '{}';
    END IF;
END $$;