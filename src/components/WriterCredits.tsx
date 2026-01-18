import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Coins, Trophy, TrendingUp, Gift } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface Credits {
  balance: number;
  total_earned: number;
}

interface EligibleMilestone {
  type: 'story' | 'novel';
  id: string;
  title: string;
  views: number;
  milestone: number;
  credits: number;
}

const MILESTONE_CREDITS = 100; // Credits awarded for 50k views

export function WriterCredits() {
  const [credits, setCredits] = useState<Credits | null>(null);
  const [loading, setLoading] = useState(true);
  const [eligibleMilestones, setEligibleMilestones] = useState<EligibleMilestone[]>([]);
  const [claiming, setClaiming] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchCredits();
      checkEligibleMilestones();
    }
  }, [user]);

  const fetchCredits = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('writer_credits')
        .select('balance, total_earned')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setCredits(data);
      } else {
        // Initialize credits for user
        const { data: newCredits, error: insertError } = await supabase
          .from('writer_credits')
          .insert({ user_id: user.id, balance: 0, total_earned: 0 })
          .select('balance, total_earned')
          .single();

        if (insertError) throw insertError;
        setCredits(newCredits);
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkEligibleMilestones = async () => {
    if (!user) return;

    try {
      // Get stories with 50k+ views that haven't claimed the milestone
      const { data: stories } = await supabase
        .from('stories')
        .select('id, title, views')
        .eq('user_id', user.id)
        .eq('is_public', true)
        .gte('views', 50000);

      // Get novels with 50k+ views
      const { data: novels } = await supabase
        .from('novels')
        .select('id, title, views')
        .eq('author_id', user.id)
        .gte('views', 50000);

      // Get already claimed milestones
      const { data: claimed } = await supabase
        .from('view_milestones')
        .select('story_id, novel_id, milestone')
        .eq('user_id', user.id);

      const claimedStoryIds = new Set(claimed?.filter(c => c.story_id).map(c => `${c.story_id}-${c.milestone}`));
      const claimedNovelIds = new Set(claimed?.filter(c => c.novel_id).map(c => `${c.novel_id}-${c.milestone}`));

      const eligible: EligibleMilestone[] = [];

      // Check stories
      stories?.forEach(story => {
        if (story.views && story.views >= 50000 && !claimedStoryIds.has(`${story.id}-50000`)) {
          eligible.push({
            type: 'story',
            id: story.id,
            title: story.title,
            views: story.views,
            milestone: 50000,
            credits: MILESTONE_CREDITS,
          });
        }
      });

      // Check novels
      novels?.forEach(novel => {
        if (novel.views && novel.views >= 50000 && !claimedNovelIds.has(`${novel.id}-50000`)) {
          eligible.push({
            type: 'novel',
            id: novel.id,
            title: novel.title,
            views: novel.views,
            milestone: 50000,
            credits: MILESTONE_CREDITS,
          });
        }
      });

      setEligibleMilestones(eligible);
    } catch (error) {
      console.error('Error checking milestones:', error);
    }
  };

  const claimMilestone = async (milestone: EligibleMilestone) => {
    if (!user || claiming) return;

    setClaiming(milestone.id);

    try {
      // Insert milestone claim
      const { error: milestoneError } = await supabase
        .from('view_milestones')
        .insert({
          user_id: user.id,
          story_id: milestone.type === 'story' ? milestone.id : null,
          novel_id: milestone.type === 'novel' ? milestone.id : null,
          milestone: milestone.milestone,
          credits_awarded: milestone.credits,
        });

      if (milestoneError) throw milestoneError;

      // Insert transaction
      const { error: transactionError } = await supabase
        .from('credit_transactions')
        .insert({
          user_id: user.id,
          amount: milestone.credits,
          type: 'milestone_reward',
          description: `50K views milestone for "${milestone.title}"`,
          story_id: milestone.type === 'story' ? milestone.id : null,
          novel_id: milestone.type === 'novel' ? milestone.id : null,
        });

      if (transactionError) throw transactionError;

      // Update credits balance
      const newBalance = (credits?.balance || 0) + milestone.credits;
      const newTotal = (credits?.total_earned || 0) + milestone.credits;

      const { error: updateError } = await supabase
        .from('writer_credits')
        .update({ balance: newBalance, total_earned: newTotal })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setCredits({ balance: newBalance, total_earned: newTotal });
      setEligibleMilestones(prev => prev.filter(m => m.id !== milestone.id));
      toast.success(`🎉 Claimed ${milestone.credits} credits for "${milestone.title}"!`);
    } catch (error) {
      console.error('Error claiming milestone:', error);
      toast.error('Failed to claim reward');
    } finally {
      setClaiming(null);
    }
  };

  if (loading) {
    return (
      <div className="glass-card rounded-xl p-6">
        <Skeleton className="h-6 w-32 mb-4" />
        <Skeleton className="h-12 w-24" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Credits Balance Card */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Coins className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-display text-foreground">Writer Credits</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-primary/10 rounded-lg">
            <p className="text-3xl font-bold text-primary">{credits?.balance || 0}</p>
            <p className="text-sm text-muted-foreground">Available</p>
          </div>
          <div className="text-center p-4 bg-secondary/50 rounded-lg">
            <p className="text-3xl font-bold text-foreground">{credits?.total_earned || 0}</p>
            <p className="text-sm text-muted-foreground">Total Earned</p>
          </div>
        </div>

        <div className="mt-4 p-3 bg-secondary/30 rounded-lg flex items-center gap-2">
          <Trophy className="w-4 h-4 text-yellow-500" />
          <p className="text-sm text-muted-foreground">
            Earn <span className="text-primary font-semibold">{MILESTONE_CREDITS} credits</span> for every 50K views!
          </p>
        </div>
      </div>

      {/* Eligible Milestones */}
      {eligibleMilestones.length > 0 && (
        <div className="glass-card rounded-xl p-6 border-2 border-primary/50">
          <div className="flex items-center gap-2 mb-4">
            <Gift className="w-5 h-5 text-primary animate-pulse" />
            <h3 className="text-lg font-display text-foreground">Rewards Available!</h3>
          </div>

          <div className="space-y-3">
            {eligibleMilestones.map((milestone) => (
              <div
                key={milestone.id}
                className="flex items-center justify-between p-3 bg-primary/10 rounded-lg"
              >
                <div>
                  <p className="font-medium text-foreground">{milestone.title}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="w-3 h-3" />
                    <span>{milestone.views.toLocaleString()} views</span>
                    <span>•</span>
                    <span className="capitalize">{milestone.type}</span>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => claimMilestone(milestone)}
                  disabled={claiming === milestone.id}
                  className="bg-primary text-primary-foreground"
                >
                  {claiming === milestone.id ? (
                    'Claiming...'
                  ) : (
                    <>
                      <Coins className="w-4 h-4 mr-1" />
                      +{milestone.credits}
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}