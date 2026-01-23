import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useFriendships, Friendship } from '@/hooks/useFriendships';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  Clock, 
  Ban, 
  Check, 
  X, 
  Trash2, 
  Loader2,
  UserX
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Friends() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    friends,
    pendingReceived,
    pendingSent,
    blockedUsers,
    loading,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    unblockUser,
  } = useFriendships();
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleAction = async (id: string, action: () => Promise<boolean>) => {
    setActionLoading(id);
    await action();
    setActionLoading(null);
  };

  const getFriendProfile = (friendship: Friendship) => {
    if (!user) return null;
    return friendship.requester_id === user.id ? friendship.addressee : friendship.requester;
  };

  if (!user) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-display text-foreground mb-2">Please log in</h2>
            <p className="text-muted-foreground">You need to be logged in to view your friends</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-display text-foreground mb-4">
              Friends
            </h1>
            <p className="text-muted-foreground">
              Manage your friends and friend requests
            </p>
          </motion.div>

          <Tabs defaultValue="friends" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-secondary/50">
              <TabsTrigger value="friends" className="gap-2">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Friends</span>
                {friends.length > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-primary/20 rounded-full text-xs">
                    {friends.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="requests" className="gap-2">
                <UserPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Requests</span>
                {pendingReceived.length > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-primary rounded-full text-xs text-primary-foreground">
                    {pendingReceived.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="sent" className="gap-2">
                <Clock className="w-4 h-4" />
                <span className="hidden sm:inline">Sent</span>
                {pendingSent.length > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-secondary rounded-full text-xs">
                    {pendingSent.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="blocked" className="gap-2">
                <Ban className="w-4 h-4" />
                <span className="hidden sm:inline">Blocked</span>
                {blockedUsers.length > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-destructive/20 rounded-full text-xs">
                    {blockedUsers.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Friends List */}
            <TabsContent value="friends" className="mt-6">
              <AnimatePresence mode="wait">
                {friends.length === 0 ? (
                  <motion.div
                    className="glass-card rounded-xl p-12 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-display text-foreground mb-2">No Friends Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start by sending friend requests to other users
                    </p>
                    <Button onClick={() => navigate('/community')} className="gap-2">
                      <UserPlus className="w-4 h-4" />
                      Find Friends
                    </Button>
                  </motion.div>
                ) : (
                  <div className="space-y-3">
                    {friends.map((friendship) => {
                      const profile = getFriendProfile(friendship);
                      if (!profile) return null;

                      return (
                        <motion.div
                          key={friendship.id}
                          className="glass-card rounded-xl p-4 flex items-center justify-between"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <div 
                            className="flex items-center gap-4 cursor-pointer flex-1"
                            onClick={() => navigate(`/profile/${profile.id}`)}
                          >
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={profile.avatar_url || undefined} />
                              <AvatarFallback className="bg-primary/20 text-primary">
                                {(profile.display_name || profile.username)?.[0]?.toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-medium text-foreground">
                                {profile.display_name || profile.username}
                              </h3>
                              <p className="text-sm text-muted-foreground">@{profile.username}</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleAction(friendship.id, () => removeFriend(friendship.id))}
                            disabled={actionLoading === friendship.id}
                          >
                            {actionLoading === friendship.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </AnimatePresence>
            </TabsContent>

            {/* Pending Requests */}
            <TabsContent value="requests" className="mt-6">
              <AnimatePresence mode="wait">
                {pendingReceived.length === 0 ? (
                  <motion.div
                    className="glass-card rounded-xl p-12 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <UserPlus className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-display text-foreground mb-2">No Pending Requests</h3>
                    <p className="text-muted-foreground">
                      You don't have any friend requests at the moment
                    </p>
                  </motion.div>
                ) : (
                  <div className="space-y-3">
                    {pendingReceived.map((friendship) => {
                      const profile = friendship.requester;
                      if (!profile) return null;

                      return (
                        <motion.div
                          key={friendship.id}
                          className="glass-card rounded-xl p-4 flex items-center justify-between"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <div 
                            className="flex items-center gap-4 cursor-pointer flex-1"
                            onClick={() => navigate(`/profile/${profile.id}`)}
                          >
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={profile.avatar_url || undefined} />
                              <AvatarFallback className="bg-primary/20 text-primary">
                                {(profile.display_name || profile.username)?.[0]?.toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-medium text-foreground">
                                {profile.display_name || profile.username}
                              </h3>
                              <p className="text-sm text-muted-foreground">@{profile.username}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="default"
                              size="sm"
                              className="gap-2"
                              onClick={() => handleAction(friendship.id, () => acceptFriendRequest(friendship.id))}
                              disabled={actionLoading === friendship.id}
                            >
                              {actionLoading === friendship.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  <Check className="w-4 h-4" />
                                  Accept
                                </>
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAction(friendship.id, () => rejectFriendRequest(friendship.id))}
                              disabled={actionLoading === friendship.id}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </AnimatePresence>
            </TabsContent>

            {/* Sent Requests */}
            <TabsContent value="sent" className="mt-6">
              <AnimatePresence mode="wait">
                {pendingSent.length === 0 ? (
                  <motion.div
                    className="glass-card rounded-xl p-12 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-display text-foreground mb-2">No Sent Requests</h3>
                    <p className="text-muted-foreground">
                      You haven't sent any friend requests
                    </p>
                  </motion.div>
                ) : (
                  <div className="space-y-3">
                    {pendingSent.map((friendship) => {
                      const profile = friendship.addressee;
                      if (!profile) return null;

                      return (
                        <motion.div
                          key={friendship.id}
                          className="glass-card rounded-xl p-4 flex items-center justify-between"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <div 
                            className="flex items-center gap-4 cursor-pointer flex-1"
                            onClick={() => navigate(`/profile/${profile.id}`)}
                          >
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={profile.avatar_url || undefined} />
                              <AvatarFallback className="bg-primary/20 text-primary">
                                {(profile.display_name || profile.username)?.[0]?.toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-medium text-foreground">
                                {profile.display_name || profile.username}
                              </h3>
                              <p className="text-sm text-muted-foreground">@{profile.username}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-muted-foreground">Pending</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleAction(friendship.id, () => rejectFriendRequest(friendship.id))}
                              disabled={actionLoading === friendship.id}
                            >
                              {actionLoading === friendship.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <X className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </AnimatePresence>
            </TabsContent>

            {/* Blocked Users */}
            <TabsContent value="blocked" className="mt-6">
              <AnimatePresence mode="wait">
                {blockedUsers.length === 0 ? (
                  <motion.div
                    className="glass-card rounded-xl p-12 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <Ban className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-display text-foreground mb-2">No Blocked Users</h3>
                    <p className="text-muted-foreground">
                      You haven't blocked anyone
                    </p>
                  </motion.div>
                ) : (
                  <div className="space-y-3">
                    {blockedUsers.map((friendship) => {
                      const profile = getFriendProfile(friendship);
                      if (!profile) return null;

                      return (
                        <motion.div
                          key={friendship.id}
                          className="glass-card rounded-xl p-4 flex items-center justify-between"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <Avatar className="w-12 h-12 opacity-50">
                              <AvatarImage src={profile.avatar_url || undefined} />
                              <AvatarFallback className="bg-secondary text-muted-foreground">
                                {(profile.display_name || profile.username)?.[0]?.toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-medium text-muted-foreground">
                                {profile.display_name || profile.username}
                              </h3>
                              <p className="text-sm text-muted-foreground">@{profile.username}</p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => handleAction(friendship.id, () => unblockUser(friendship.id))}
                            disabled={actionLoading === friendship.id}
                          >
                            {actionLoading === friendship.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <UserX className="w-4 h-4" />
                                Unblock
                              </>
                            )}
                          </Button>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </AnimatePresence>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
}
