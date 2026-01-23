import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'blocked';
  blocked_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined profile data
  requester?: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
  addressee?: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

export function useFriendships() {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [pendingReceived, setPendingReceived] = useState<Friendship[]>([]);
  const [pendingSent, setPendingSent] = useState<Friendship[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<Friendship[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFriendships = useCallback(async () => {
    if (!user) {
      setFriends([]);
      setPendingReceived([]);
      setPendingSent([]);
      setBlockedUsers([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('friendships')
        .select(`
          *,
          requester:profiles!friendships_requester_id_fkey(id, username, display_name, avatar_url),
          addressee:profiles!friendships_addressee_id_fkey(id, username, display_name, avatar_url)
        `)
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

      if (error) throw error;

      const friendships = (data || []) as unknown as Friendship[];

      // Accepted friends
      setFriends(friendships.filter(f => f.status === 'accepted'));

      // Pending requests received
      setPendingReceived(
        friendships.filter(f => f.status === 'pending' && f.addressee_id === user.id)
      );

      // Pending requests sent
      setPendingSent(
        friendships.filter(f => f.status === 'pending' && f.requester_id === user.id)
      );

      // Blocked users
      setBlockedUsers(
        friendships.filter(f => f.status === 'blocked' && f.blocked_by === user.id)
      );
    } catch (error) {
      console.error('Error fetching friendships:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFriendships();
  }, [fetchFriendships]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('friendships_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friendships',
          filter: `requester_id=eq.${user.id}`,
        },
        () => fetchFriendships()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friendships',
          filter: `addressee_id=eq.${user.id}`,
        },
        () => fetchFriendships()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchFriendships]);

  const sendFriendRequest = async (addresseeId: string) => {
    if (!user) {
      toast.error('Please log in to send friend requests');
      return false;
    }

    if (addresseeId === user.id) {
      toast.error("You can't send a friend request to yourself");
      return false;
    }

    try {
      const { error } = await supabase.from('friendships').insert({
        requester_id: user.id,
        addressee_id: addresseeId,
        status: 'pending',
      });

      if (error) {
        if (error.code === '23505') {
          toast.error('Friend request already exists');
        } else {
          throw error;
        }
        return false;
      }

      toast.success('Friend request sent!');
      return true;
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast.error('Failed to send friend request');
      return false;
    }
  };

  const acceptFriendRequest = async (friendshipId: string) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'accepted' })
        .eq('id', friendshipId);

      if (error) throw error;
      toast.success('Friend request accepted!');
      return true;
    } catch (error) {
      console.error('Error accepting friend request:', error);
      toast.error('Failed to accept friend request');
      return false;
    }
  };

  const rejectFriendRequest = async (friendshipId: string) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId);

      if (error) throw error;
      toast.success('Friend request rejected');
      return true;
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      toast.error('Failed to reject friend request');
      return false;
    }
  };

  const removeFriend = async (friendshipId: string) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId);

      if (error) throw error;
      toast.success('Friend removed');
      return true;
    } catch (error) {
      console.error('Error removing friend:', error);
      toast.error('Failed to remove friend');
      return false;
    }
  };

  const blockUser = async (userId: string) => {
    if (!user) return false;

    try {
      // Check if friendship exists
      const { data: existing } = await supabase
        .from('friendships')
        .select('id')
        .or(`and(requester_id.eq.${user.id},addressee_id.eq.${userId}),and(requester_id.eq.${userId},addressee_id.eq.${user.id})`)
        .single();

      if (existing) {
        // Update existing friendship to blocked
        const { error } = await supabase
          .from('friendships')
          .update({ status: 'blocked', blocked_by: user.id })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Create new blocked relationship
        const { error } = await supabase.from('friendships').insert({
          requester_id: user.id,
          addressee_id: userId,
          status: 'blocked',
          blocked_by: user.id,
        });

        if (error) throw error;
      }

      toast.success('User blocked');
      return true;
    } catch (error) {
      console.error('Error blocking user:', error);
      toast.error('Failed to block user');
      return false;
    }
  };

  const unblockUser = async (friendshipId: string) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId);

      if (error) throw error;
      toast.success('User unblocked');
      return true;
    } catch (error) {
      console.error('Error unblocking user:', error);
      toast.error('Failed to unblock user');
      return false;
    }
  };

  const getFriendshipStatus = (userId: string): 'none' | 'pending_sent' | 'pending_received' | 'friends' | 'blocked' => {
    if (!user) return 'none';

    const allFriendships = [...friends, ...pendingReceived, ...pendingSent, ...blockedUsers];
    const friendship = allFriendships.find(
      f => f.requester_id === userId || f.addressee_id === userId
    );

    if (!friendship) return 'none';

    if (friendship.status === 'blocked') return 'blocked';
    if (friendship.status === 'accepted') return 'friends';
    if (friendship.status === 'pending') {
      return friendship.requester_id === user.id ? 'pending_sent' : 'pending_received';
    }

    return 'none';
  };

  const getFriendshipId = (userId: string): string | null => {
    const allFriendships = [...friends, ...pendingReceived, ...pendingSent, ...blockedUsers];
    const friendship = allFriendships.find(
      f => f.requester_id === userId || f.addressee_id === userId
    );
    return friendship?.id || null;
  };

  return {
    friends,
    pendingReceived,
    pendingSent,
    blockedUsers,
    loading,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    blockUser,
    unblockUser,
    getFriendshipStatus,
    getFriendshipId,
    refetch: fetchFriendships,
  };
}
