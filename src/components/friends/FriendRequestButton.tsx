import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useFriendships } from '@/hooks/useFriendships';
import { useAuth } from '@/contexts/AuthContext';
import { UserPlus, UserCheck, UserX, Clock, Ban, MoreHorizontal, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface FriendRequestButtonProps {
  userId: string;
  variant?: 'default' | 'compact';
}

export function FriendRequestButton({ userId, variant = 'default' }: FriendRequestButtonProps) {
  const { user } = useAuth();
  const {
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    blockUser,
    getFriendshipStatus,
    getFriendshipId,
  } = useFriendships();
  const [loading, setLoading] = useState(false);

  // Don't show button for own profile or if not logged in
  if (!user || userId === user.id) return null;

  const status = getFriendshipStatus(userId);
  const friendshipId = getFriendshipId(userId);

  const handleAction = async (action: () => Promise<boolean>) => {
    setLoading(true);
    await action();
    setLoading(false);
  };

  if (loading) {
    return (
      <Button variant="outline" size={variant === 'compact' ? 'sm' : 'default'} disabled>
        <Loader2 className="w-4 h-4 animate-spin" />
      </Button>
    );
  }

  switch (status) {
    case 'none':
      return (
        <Button
          variant="default"
          size={variant === 'compact' ? 'sm' : 'default'}
          onClick={() => handleAction(() => sendFriendRequest(userId))}
          className="gap-2"
        >
          <UserPlus className="w-4 h-4" />
          {variant === 'default' && 'Add Friend'}
        </Button>
      );

    case 'pending_sent':
      return (
        <Button
          variant="outline"
          size={variant === 'compact' ? 'sm' : 'default'}
          disabled
          className="gap-2"
        >
          <Clock className="w-4 h-4" />
          {variant === 'default' && 'Request Sent'}
        </Button>
      );

    case 'pending_received':
      return (
        <div className="flex gap-2">
          <Button
            variant="default"
            size={variant === 'compact' ? 'sm' : 'default'}
            onClick={() => handleAction(() => acceptFriendRequest(friendshipId!))}
            className="gap-2"
          >
            <UserCheck className="w-4 h-4" />
            {variant === 'default' && 'Accept'}
          </Button>
          <Button
            variant="outline"
            size={variant === 'compact' ? 'sm' : 'default'}
            onClick={() => handleAction(() => rejectFriendRequest(friendshipId!))}
            className="gap-2"
          >
            <UserX className="w-4 h-4" />
            {variant === 'default' && 'Decline'}
          </Button>
        </div>
      );

    case 'friends':
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size={variant === 'compact' ? 'sm' : 'default'} className="gap-2">
              <UserCheck className="w-4 h-4 text-green-500" />
              {variant === 'default' && 'Friends'}
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover border-border">
            <DropdownMenuItem
              onClick={() => handleAction(() => removeFriend(friendshipId!))}
              className="text-destructive cursor-pointer"
            >
              <UserX className="w-4 h-4 mr-2" />
              Remove Friend
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleAction(() => blockUser(userId))}
              className="text-destructive cursor-pointer"
            >
              <Ban className="w-4 h-4 mr-2" />
              Block User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

    case 'blocked':
      return (
        <Button
          variant="outline"
          size={variant === 'compact' ? 'sm' : 'default'}
          disabled
          className="gap-2 text-muted-foreground"
        >
          <Ban className="w-4 h-4" />
          {variant === 'default' && 'Blocked'}
        </Button>
      );

    default:
      return null;
  }
}
