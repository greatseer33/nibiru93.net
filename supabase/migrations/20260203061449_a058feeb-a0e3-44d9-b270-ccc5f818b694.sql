-- Create poems table
CREATE TABLE public.poems (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  is_public BOOLEAN NOT NULL DEFAULT false,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create poem_likes table
CREATE TABLE public.poem_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poem_id UUID NOT NULL REFERENCES public.poems(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(poem_id, user_id)
);

-- Enable RLS on poems
ALTER TABLE public.poems ENABLE ROW LEVEL SECURITY;

-- Poems RLS policies
CREATE POLICY "Users can view public poems or own poems"
ON public.poems FOR SELECT
USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can insert own poems"
ON public.poems FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own poems"
ON public.poems FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own poems"
ON public.poems FOR DELETE
USING (auth.uid() = user_id);

-- Enable RLS on poem_likes
ALTER TABLE public.poem_likes ENABLE ROW LEVEL SECURITY;

-- Poem likes RLS policies
CREATE POLICY "Anyone can view poem likes"
ON public.poem_likes FOR SELECT
USING (true);

CREATE POLICY "Users can insert own likes"
ON public.poem_likes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes"
ON public.poem_likes FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_poems_updated_at
BEFORE UPDATE ON public.poems
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for poems
ALTER PUBLICATION supabase_realtime ADD TABLE public.poems;
ALTER PUBLICATION supabase_realtime ADD TABLE public.poem_likes;