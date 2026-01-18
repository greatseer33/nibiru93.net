import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, User, Clock, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { ReportDialog } from '@/components/ReportDialog';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface Story {
  id: string;
  title: string;
  content: string;
  word_count: number;
  created_at: string;
  user_id: string;
}

interface StoryWithProfile extends Story {
  profile?: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

export function PublicStoryFeed() {
  const [stories, setStories] = useState<StoryWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchPublicStories();
  }, []);

  const fetchPublicStories = async () => {
    try {
      const { data: storiesData, error } = await supabase
        .from('stories')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Fetch profiles for each story
      const storiesWithProfiles: StoryWithProfile[] = await Promise.all(
        (storiesData || []).map(async (story) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('username, display_name, avatar_url')
            .eq('id', story.user_id)
            .single();

          return { ...story, profile: profile || undefined };
        })
      );

      setStories(storiesWithProfiles);
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card p-6 rounded-xl">
            <Skeleton className="h-6 w-3/4 mb-4" />
            <Skeleton className="h-20 w-full mb-4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (stories.length === 0) {
    return (
      <div className="glass-card p-8 rounded-xl text-center">
        <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No Public Stories Yet</h3>
        <p className="text-muted-foreground">
          Be the first to share a story with the community!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {stories.map((story, index) => (
        <motion.div
          key={story.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="glass-card p-6 rounded-xl hover:border-primary/30 transition-colors"
        >
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-foreground mb-1">
                {story.title}
              </h3>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span>{story.profile?.display_name || story.profile?.username || 'Anonymous'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatDistanceToNow(new Date(story.created_at), { addSuffix: true })}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>{story.word_count} words</span>
                </div>
              </div>
            </div>
            {user && story.user_id !== user.id && (
              <ReportDialog storyId={story.id} storyTitle={story.title} />
            )}
          </div>
          
          <p className="text-foreground/80 line-clamp-4 whitespace-pre-wrap">
            {story.content}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
