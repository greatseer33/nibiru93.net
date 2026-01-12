import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, BookOpen, Trash2, Edit2, Save, X, Eye, EyeOff, FileText, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MainLayout } from '@/components/layout/MainLayout';
import { ReportDialog } from '@/components/ReportDialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Story {
  id: string;
  title: string;
  content: string;
  is_public: boolean;
  word_count: number;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export default function Stories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [showNewStory, setShowNewStory] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [newTitle, setNewTitle] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editPublic, setEditPublic] = useState(false);
  
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedContentRef = useRef<string>('');

  const { t } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchStories();
      
      // Subscribe to real-time updates
      const channel = supabase
        .channel('stories-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'stories',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setStories(prev => [payload.new as Story, ...prev]);
            } else if (payload.eventType === 'UPDATE') {
              setStories(prev => prev.map(s => 
                s.id === (payload.new as Story).id ? payload.new as Story : s
              ));
              // Update active story if it's the one being edited
              if (activeStory?.id === (payload.new as Story).id) {
                setActiveStory(payload.new as Story);
              }
            } else if (payload.eventType === 'DELETE') {
              setStories(prev => prev.filter(s => s.id !== (payload.old as Story).id));
              if (activeStory?.id === (payload.old as Story).id) {
                setActiveStory(null);
              }
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchStories = async () => {
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      toast.error('Failed to load stories');
    } else {
      setStories(data || []);
    }
    setLoading(false);
  };

  const countWords = (text: string) => {
    return text.split(/\s+/).filter(Boolean).length;
  };

  const handleCreateStory = async () => {
    if (!newTitle.trim()) {
      toast.error('Please enter a title');
      return;
    }

    const { data, error } = await supabase
      .from('stories')
      .insert({
        user_id: user?.id,
        title: newTitle.trim(),
        content: '',
        is_public: false,
        word_count: 0,
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to create story');
    } else {
      setNewTitle('');
      setShowNewStory(false);
      // Open the new story for editing
      setActiveStory(data);
      setEditTitle(data.title);
      setEditContent(data.content);
      setEditPublic(data.is_public);
      lastSavedContentRef.current = data.content;
      toast.success('Story created! Start writing...');
    }
  };

  // Auto-save function with debounce
  const autoSave = useCallback(async (storyId: string, title: string, content: string, isPublic: boolean) => {
    if (content === lastSavedContentRef.current && title === activeStory?.title && isPublic === activeStory?.is_public) {
      return; // No changes to save
    }

    setSaving(true);
    const wordCount = countWords(content);
    
    const { error } = await supabase
      .from('stories')
      .update({ 
        title, 
        content, 
        is_public: isPublic,
        word_count: wordCount 
      })
      .eq('id', storyId);

    if (error) {
      toast.error('Failed to save');
    } else {
      lastSavedContentRef.current = content;
    }
    setSaving(false);
  }, [activeStory]);

  // Handle content change with debounced auto-save
  const handleContentChange = (content: string) => {
    setEditContent(content);
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      if (activeStory) {
        autoSave(activeStory.id, editTitle, content, editPublic);
      }
    }, 1000); // Auto-save after 1 second of inactivity
  };

  const handleTitleChange = (title: string) => {
    setEditTitle(title);
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      if (activeStory) {
        autoSave(activeStory.id, title, editContent, editPublic);
      }
    }, 1000);
  };

  const handleTogglePublic = () => {
    const newPublic = !editPublic;
    setEditPublic(newPublic);
    if (activeStory) {
      autoSave(activeStory.id, editTitle, editContent, newPublic);
    }
  };

  const handleOpenStory = (story: Story) => {
    // Save current story before switching
    if (activeStory && saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      autoSave(activeStory.id, editTitle, editContent, editPublic);
    }
    
    setActiveStory(story);
    setEditTitle(story.title);
    setEditContent(story.content);
    setEditPublic(story.is_public);
    lastSavedContentRef.current = story.content;
  };

  const handleCloseStory = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    if (activeStory) {
      autoSave(activeStory.id, editTitle, editContent, editPublic);
    }
    setActiveStory(null);
  };

  const handleDeleteStory = async (id: string) => {
    const { error } = await supabase
      .from('stories')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete story');
    } else {
      toast.success('Story deleted');
      if (activeStory?.id === id) {
        setActiveStory(null);
      }
    }
  };

  if (authLoading || loading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-muted-foreground">{t('common.loading')}</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-display text-foreground mb-4">
              Story Writing
            </h1>
            <p className="text-muted-foreground">
              Write your stories with real-time saving - every keystroke is preserved
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Stories List */}
            <motion.div
              className="lg:col-span-1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {/* New Story Button */}
              <div className="mb-4">
                {!showNewStory ? (
                  <Button
                    onClick={() => setShowNewStory(true)}
                    className="w-full py-4 bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    New Story
                  </Button>
                ) : (
                  <motion.div
                    className="glass-card rounded-xl p-4"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <Input
                      placeholder="Story title..."
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="mb-3 bg-secondary/50 border-border"
                      onKeyDown={(e) => e.key === 'Enter' && handleCreateStory()}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleCreateStory} size="sm" className="bg-primary text-primary-foreground">
                        Create
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setShowNewStory(false)}>
                        Cancel
                      </Button>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Stories List */}
              <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                <AnimatePresence>
                  {stories.length === 0 ? (
                    <motion.div
                      className="text-center py-10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">No stories yet</p>
                    </motion.div>
                  ) : (
                    stories.map((story, index) => (
                      <motion.div
                        key={story.id}
                        className={`glass-card rounded-lg p-4 cursor-pointer transition-all hover:border-primary/50 ${
                          activeStory?.id === story.id ? 'ring-2 ring-primary' : ''
                        }`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: index * 0.03 }}
                        onClick={() => handleOpenStory(story)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {story.is_public ? (
                                <Eye className="w-3 h-3 text-green-400 flex-shrink-0" />
                              ) : (
                                <EyeOff className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                              )}
                              <h3 className="font-display text-foreground truncate">{story.title}</h3>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span>{story.word_count} words</span>
                              <span>{format(new Date(story.updated_at), 'MMM d')}</span>
                            </div>
                          </div>
                          <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
                            {story.is_public && story.user_id !== user?.id && (
                              <ReportDialog storyId={story.id} storyTitle={story.title} />
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive flex-shrink-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteStory(story.id);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Editor Panel */}
            <motion.div
              className="lg:col-span-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {activeStory ? (
                <div className="glass-card rounded-xl p-6 h-full min-h-[60vh]">
                  {/* Editor Header */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-border/50">
                    <div className="flex-1 mr-4">
                      <Input
                        value={editTitle}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        className="text-xl font-display bg-transparent border-none p-0 h-auto focus-visible:ring-0"
                        placeholder="Story title..."
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      {saving && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Saving...
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleTogglePublic}
                        className={`gap-1 ${editPublic ? 'text-green-400' : 'text-muted-foreground'}`}
                      >
                        {editPublic ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        {editPublic ? 'Public' : 'Private'}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={handleCloseStory}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Editor Content */}
                  <Textarea
                    value={editContent}
                    onChange={(e) => handleContentChange(e.target.value)}
                    className="w-full h-[calc(100%-80px)] min-h-[400px] bg-transparent border-none resize-none text-foreground/90 leading-relaxed focus-visible:ring-0"
                    placeholder="Start writing your story..."
                  />

                  {/* Word Count */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50 text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span>{countWords(editContent)} words</span>
                      <span>{editContent.length} characters</span>
                    </div>
                    <span>Last saved: {format(new Date(activeStory.updated_at), 'h:mm a')}</span>
                  </div>
                </div>
              ) : (
                <div className="glass-card rounded-xl p-6 h-full min-h-[60vh] flex flex-col items-center justify-center text-center">
                  <FileText className="w-16 h-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-display text-foreground mb-2">Select a Story</h3>
                  <p className="text-muted-foreground">
                    Choose a story from the list or create a new one to start writing
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
