import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, User, Save, Loader2, Trash2, BookOpen, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MainLayout } from '@/components/layout/MainLayout';
import { WriterCredits } from '@/components/WriterCredits';
import { FriendRequestButton } from '@/components/friends/FriendRequestButton';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
}

interface ProfileStats {
  story_count: number;
  novel_count: number;
}

export default function Profile() {
  const { userId } = useParams<{ userId?: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<ProfileStats>({ story_count: 0, novel_count: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Determine if viewing own profile or someone else's
  const isOwnProfile = !userId || (user && userId === user.id);
  const targetUserId = userId || user?.id;

  useEffect(() => {
    // Only redirect to auth if viewing own profile and not logged in
    if (!authLoading && !user && !userId) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate, userId]);

  useEffect(() => {
    if (targetUserId) {
      fetchProfile(targetUserId);
    }
  }, [targetUserId]);

  const fetchProfile = async (profileId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .single();

      if (error) throw error;

      setProfile(data);
      setDisplayName(data.display_name || '');
      setBio(data.bio || '');
      setAvatarUrl(data.avatar_url);

      // Fetch stats
      const [storiesRes, novelsRes] = await Promise.all([
        supabase
          .from('stories')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', profileId)
          .eq('is_public', true),
        supabase
          .from('novels')
          .select('id', { count: 'exact', head: true })
          .eq('author_id', profileId),
      ]);

      setStats({
        story_count: storiesRes.count || 0,
        novel_count: novelsRes.count || 0,
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      // Delete old avatar if exists
      if (avatarUrl) {
        const oldPath = avatarUrl.split('/').slice(-2).join('/');
        await supabase.storage.from('avatars').remove([oldPath]);
      }

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      toast.success('Avatar updated successfully');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName || null,
          bio: bio || null,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    setDeleting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Please sign in again to delete your account');
        return;
      }

      const { data, error } = await supabase.functions.invoke('delete-account', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data?.success) {
        toast.success('Account deleted successfully');
        navigate('/');
      } else {
        throw new Error(data?.error || 'Failed to delete account');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account');
    } finally {
      setDeleting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  // Public profile view for other users
  if (!isOwnProfile && profile) {
    return (
      <MainLayout>
        <div className="min-h-screen py-20 px-4">
          <div className="container mx-auto max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl p-8"
            >
              {/* Avatar and Name */}
              <div className="flex flex-col items-center mb-8">
                <Avatar className="w-32 h-32 border-4 border-primary/20 mb-4">
                  <AvatarImage src={avatarUrl || undefined} alt="Profile avatar" />
                  <AvatarFallback className="bg-secondary text-4xl">
                    {(profile.display_name || profile.username)?.[0]?.toUpperCase() || <User className="w-12 h-12" />}
                  </AvatarFallback>
                </Avatar>

                <h1 className="text-3xl font-display text-foreground mb-1">
                  {profile.display_name || profile.username}
                </h1>
                <p className="text-muted-foreground mb-4">@{profile.username}</p>

                {/* Friend Request Button */}
                <FriendRequestButton userId={profile.id} />
              </div>

              {/* Bio */}
              {profile.bio && (
                <div className="mb-8 text-center">
                  <p className="text-foreground/80">{profile.bio}</p>
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center justify-center gap-8 text-center">
                <div>
                  <div className="flex items-center gap-2 justify-center text-2xl font-display text-foreground">
                    <FileText className="w-5 h-5 text-primary" />
                    {stats.story_count}
                  </div>
                  <p className="text-sm text-muted-foreground">Stories</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 justify-center text-2xl font-display text-foreground">
                    <BookOpen className="w-5 h-5 text-primary" />
                    {stats.novel_count}
                  </div>
                  <p className="text-sm text-muted-foreground">Novels</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Own profile edit view
  return (
    <MainLayout>
      <div className="min-h-screen py-20 px-4">
        <div className="container mx-auto max-w-2xl space-y-6">
          {/* Writer Credits Section */}
          <WriterCredits />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-8"
          >
            <h1 className="text-3xl font-display text-primary gold-glow mb-8 text-center">
              Your Profile
            </h1>

            {/* Avatar Section */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative group">
                <Avatar className="w-32 h-32 border-4 border-primary/20">
                  <AvatarImage src={avatarUrl || undefined} alt="Profile avatar" />
                  <AvatarFallback className="bg-secondary text-4xl">
                    {displayName?.[0]?.toUpperCase() || profile?.username?.[0]?.toUpperCase() || <User className="w-12 h-12" />}
                  </AvatarFallback>
                </Avatar>
                
                <button
                  onClick={handleAvatarClick}
                  disabled={uploading}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  {uploading ? (
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  ) : (
                    <Camera className="w-8 h-8 text-white" />
                  )}
                </button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
              
              <p className="text-sm text-muted-foreground mt-2">
                Click to change avatar
              </p>
            </div>

            {/* Profile Form */}
            <div className="space-y-6">
              {/* Username (read-only) */}
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={profile?.username || ''}
                  disabled
                  className="bg-secondary/30 border-border"
                />
                <p className="text-xs text-muted-foreground">
                  Username cannot be changed
                </p>
              </div>

              {/* Display Name */}
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="How you want to be called"
                  className="bg-secondary/50 border-border"
                />
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us a bit about yourself..."
                  rows={4}
                  className="bg-secondary/50 border-border resize-none"
                />
              </div>

              {/* Email (read-only) */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-secondary/30 border-border"
                />
              </div>

              {/* Save Button */}
              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                size="lg"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>

              {/* Danger Zone */}
              <div className="pt-8 mt-8 border-t border-destructive/20">
                <h2 className="text-lg font-semibold text-destructive mb-4">Danger Zone</h2>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="w-full"
                      size="lg"
                      disabled={deleting}
                    >
                      {deleting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Deleting Account...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Account
                        </>
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-background border-border">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-destructive">Delete Account</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your account
                        and remove all your data including stories, diary entries, and novels.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Yes, delete my account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
}
