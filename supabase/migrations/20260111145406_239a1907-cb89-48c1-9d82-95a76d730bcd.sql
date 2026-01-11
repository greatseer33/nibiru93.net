-- Add pinned column to diary_entries table
ALTER TABLE public.diary_entries 
ADD COLUMN is_pinned boolean NOT NULL DEFAULT false;