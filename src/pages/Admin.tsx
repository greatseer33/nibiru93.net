import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, Check, X, Trash2, Eye, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Report {
  id: string;
  reason: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
  story_id: string;
  reporter_id: string;
  story?: {
    id: string;
    title: string;
    content: string;
    user_id: string;
  };
}

export default function Admin() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [viewStoryDialog, setViewStoryDialog] = useState(false);

  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !adminLoading) {
      if (!user) {
        navigate('/auth');
      } else if (!isAdmin) {
        navigate('/');
        toast.error('Access denied. Admin only.');
      }
    }
  }, [user, isAdmin, authLoading, adminLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchReports();
    }
  }, [isAdmin]);

  const fetchReports = async () => {
    const { data, error } = await supabase
      .from('reports')
      .select(`
        *,
        story:stories(id, title, content, user_id)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load reports');
    } else {
      setReports(data || []);
    }
    setLoading(false);
  };

  const handleUpdateStatus = async (reportId: string, status: string) => {
    setProcessing(true);
    const { error } = await supabase
      .from('reports')
      .update({ status, admin_notes: adminNotes || null })
      .eq('id', reportId);

    if (error) {
      toast.error('Failed to update report');
    } else {
      toast.success(`Report marked as ${status}`);
      fetchReports();
      setSelectedReport(null);
      setAdminNotes('');
    }
    setProcessing(false);
  };

  const handleDeleteStory = async (storyId: string, reportId: string) => {
    setProcessing(true);
    const { error } = await supabase.from('stories').delete().eq('id', storyId);

    if (error) {
      toast.error('Failed to delete story');
    } else {
      await handleUpdateStatus(reportId, 'action_taken');
      toast.success('Story deleted and report resolved');
    }
    setProcessing(false);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-500/20 text-yellow-400',
      reviewed: 'bg-blue-500/20 text-blue-400',
      dismissed: 'bg-muted text-muted-foreground',
      action_taken: 'bg-green-500/20 text-green-400',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${styles[status] || styles.pending}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  if (authLoading || adminLoading || loading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <MainLayout>
      <div className="min-h-screen py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Shield className="w-10 h-10 text-primary" />
              <h1 className="text-4xl md:text-5xl font-display text-foreground">
                Admin Panel
              </h1>
            </div>
            <p className="text-muted-foreground">
              Review and manage reported content
            </p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Pending', count: reports.filter(r => r.status === 'pending').length, color: 'text-yellow-400' },
              { label: 'Reviewed', count: reports.filter(r => r.status === 'reviewed').length, color: 'text-blue-400' },
              { label: 'Dismissed', count: reports.filter(r => r.status === 'dismissed').length, color: 'text-muted-foreground' },
              { label: 'Action Taken', count: reports.filter(r => r.status === 'action_taken').length, color: 'text-green-400' },
            ].map((stat) => (
              <div key={stat.label} className="glass-card rounded-lg p-4 text-center">
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.count}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Reports List */}
          <div className="space-y-4">
            {reports.length === 0 ? (
              <div className="glass-card rounded-xl p-12 text-center">
                <Check className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-display text-foreground mb-2">All Clear!</h3>
                <p className="text-muted-foreground">No reports to review</p>
              </div>
            ) : (
              reports.map((report) => (
                <motion.div
                  key={report.id}
                  className="glass-card rounded-xl p-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-400" />
                        <h3 className="font-display text-foreground">
                          {report.story?.title || 'Story Deleted'}
                        </h3>
                        {getStatusBadge(report.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        <strong>Reason:</strong> {report.reason}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Reported on {format(new Date(report.created_at), 'MMM d, yyyy h:mm a')}
                      </p>
                      {report.admin_notes && (
                        <p className="text-sm text-muted-foreground mt-2 border-t border-border/50 pt-2">
                          <strong>Admin Notes:</strong> {report.admin_notes}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {report.story && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedReport(report);
                            setViewStoryDialog(true);
                          }}
                          title="View story"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
                      {report.status === 'pending' && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-green-400 hover:text-green-300"
                            onClick={() => handleUpdateStatus(report.id, 'dismissed')}
                            title="Dismiss report"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                          {report.story && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDeleteStory(report.story!.id, report.id)}
                              title="Delete story"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* View Story Dialog */}
      <Dialog open={viewStoryDialog} onOpenChange={setViewStoryDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedReport?.story?.title}</DialogTitle>
            <DialogDescription>
              Review the reported content
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div className="bg-secondary/50 rounded-lg p-4 max-h-[300px] overflow-y-auto">
              <p className="whitespace-pre-wrap text-sm">{selectedReport?.story?.content || 'No content'}</p>
            </div>
            <div className="border-t border-border/50 pt-4">
              <label className="text-sm font-medium mb-2 block">Admin Notes (optional)</label>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add notes about your decision..."
                className="mb-4"
              />
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (selectedReport) {
                      handleUpdateStatus(selectedReport.id, 'dismissed');
                    }
                    setViewStoryDialog(false);
                  }}
                  disabled={processing}
                >
                  Dismiss Report
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (selectedReport?.story) {
                      handleDeleteStory(selectedReport.story.id, selectedReport.id);
                    }
                    setViewStoryDialog(false);
                  }}
                  disabled={processing}
                >
                  {processing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                  Delete Story
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
