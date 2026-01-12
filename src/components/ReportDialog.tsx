import { useState } from 'react';
import { Flag, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ReportDialogProps {
  storyId: string;
  storyTitle: string;
}

export function ReportDialog({ storyId, storyTitle }: ReportDialogProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error('Please provide a reason for the report');
      return;
    }

    if (!user) {
      toast.error('You must be logged in to report content');
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.from('reports').insert({
      reporter_id: user.id,
      story_id: storyId,
      reason: reason.trim(),
    });

    if (error) {
      if (error.code === '23505') {
        toast.error('You have already reported this story');
      } else {
        toast.error('Failed to submit report');
      }
    } else {
      toast.success('Report submitted. Thank you for helping keep our community safe.');
      setReason('');
      setOpen(false);
    }

    setSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          title="Report this story"
        >
          <Flag className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report Story</DialogTitle>
          <DialogDescription>
            Report "{storyTitle}" for inappropriate content. Our team will review your report.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <Textarea
            placeholder="Please describe why you're reporting this story..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="min-h-[100px]"
            maxLength={500}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Flag className="w-4 h-4 mr-2" />
                  Submit Report
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
