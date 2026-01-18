-- Add views column to stories table
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS views integer DEFAULT 0;

-- Create writer_credits table to track credits
CREATE TABLE public.writer_credits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  balance integer NOT NULL DEFAULT 0,
  total_earned integer NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create credit_transactions table to track credit history
CREATE TABLE public.credit_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('milestone_reward', 'bonus', 'spent', 'refund')),
  description TEXT,
  story_id UUID REFERENCES public.stories(id) ON DELETE SET NULL,
  novel_id UUID REFERENCES public.novels(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create view_milestones table to track claimed milestones
CREATE TABLE public.view_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
  novel_id UUID REFERENCES public.novels(id) ON DELETE CASCADE,
  milestone integer NOT NULL,
  credits_awarded integer NOT NULL,
  claimed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(story_id, milestone),
  UNIQUE(novel_id, milestone)
);

-- Enable RLS on all new tables
ALTER TABLE public.writer_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.view_milestones ENABLE ROW LEVEL SECURITY;

-- RLS policies for writer_credits
CREATE POLICY "Users can view their own credits"
  ON public.writer_credits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own credits"
  ON public.writer_credits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own credits"
  ON public.writer_credits FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS policies for credit_transactions
CREATE POLICY "Users can view their own transactions"
  ON public.credit_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
  ON public.credit_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS policies for view_milestones
CREATE POLICY "Users can view their own milestones"
  ON public.view_milestones FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own milestones"
  ON public.view_milestones FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create trigger for updated_at on writer_credits
CREATE TRIGGER update_writer_credits_updated_at
  BEFORE UPDATE ON public.writer_credits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();