-- Create friendships table for friend requests and relationships
CREATE TABLE public.friendships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  addressee_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')),
  blocked_by uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT unique_friendship UNIQUE (requester_id, addressee_id),
  CONSTRAINT no_self_friend CHECK (requester_id != addressee_id)
);

-- Enable RLS
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- Users can view friendships where they are involved
CREATE POLICY "Users can view own friendships"
ON public.friendships
FOR SELECT
USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- Users can send friend requests
CREATE POLICY "Users can send friend requests"
ON public.friendships
FOR INSERT
WITH CHECK (auth.uid() = requester_id AND status = 'pending');

-- Users can update friendships they're part of (accept/reject/block)
CREATE POLICY "Users can update friendships"
ON public.friendships
FOR UPDATE
USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- Users can delete friendships they're part of
CREATE POLICY "Users can delete friendships"
ON public.friendships
FOR DELETE
USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- Add trigger for updated_at
CREATE TRIGGER update_friendships_updated_at
BEFORE UPDATE ON public.friendships
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for friend request notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.friendships;