import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, BookOpen, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

interface UserProfile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  story_count: number;
  novel_count: number;
}

export function UserProfiles() {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const { data: profilesData, error } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url, bio')
        .limit(20);

      if (error) throw error;

      // Get counts for each profile
      const profilesWithCounts = await Promise.all(
        (profilesData || []).map(async (profile) => {
          const [storiesRes, novelsRes] = await Promise.all([
            supabase
              .from('stories')
              .select('id', { count: 'exact', head: true })
              .eq('user_id', profile.id)
              .eq('is_public', true),
            supabase
              .from('novels')
              .select('id', { count: 'exact', head: true })
              .eq('author_id', profile.id),
          ]);

          return {
            ...profile,
            story_count: storiesRes.count || 0,
            novel_count: novelsRes.count || 0,
          };
        })
      );

      // Sort by activity (stories + novels)
      profilesWithCounts.sort((a, b) => 
        (b.story_count + b.novel_count) - (a.story_count + a.novel_count)
      );

      setProfiles(profilesWithCounts);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="glass-card p-6 rounded-xl">
            <div className="flex items-center gap-4 mb-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-5 w-24 mb-2" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
            <Skeleton className="h-12 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="glass-card p-8 rounded-xl text-center">
        <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No Members Yet</h3>
        <p className="text-muted-foreground">
          Be the first to join the community!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {profiles.map((profile, index) => (
        <motion.div
          key={profile.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
          className="glass-card p-6 rounded-xl hover:border-primary/30 transition-colors"
        >
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="w-16 h-16 border-2 border-primary/20">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="bg-secondary text-lg">
                {(profile.display_name || profile.username)?.[0]?.toUpperCase() || <User className="w-6 h-6" />}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-foreground">
                {profile.display_name || profile.username}
              </h3>
              <p className="text-sm text-muted-foreground">@{profile.username}</p>
            </div>
          </div>

          {profile.bio && (
            <p className="text-sm text-foreground/70 line-clamp-2 mb-4">
              {profile.bio}
            </p>
          )}

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <FileText className="w-4 h-4" />
              <span>{profile.story_count} stories</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              <span>{profile.novel_count} novels</span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
