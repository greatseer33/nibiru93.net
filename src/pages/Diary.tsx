import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, PenTool, Trash2, Edit2, Save, X, Smile, Meh, Frown, Heart, Sparkles, Pin } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MainLayout } from '@/components/layout/MainLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DiaryEntry {
  id: string;
  title: string;
  content: string;
  mood: string | null;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

const moodIcons = {
  happy: { icon: Smile, color: 'text-green-400' },
  neutral: { icon: Meh, color: 'text-yellow-400' },
  sad: { icon: Frown, color: 'text-blue-400' },
  love: { icon: Heart, color: 'text-pink-400' },
  inspired: { icon: Sparkles, color: 'text-primary' },
};

export default function Diary() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newMood, setNewMood] = useState<string>('neutral');

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
      fetchEntries();
    }
  }, [user]);

  const fetchEntries = async () => {
    const { data, error } = await supabase
      .from('diary_entries')
      .select('*')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load diary entries');
    } else {
      setEntries(data || []);
    }
    setLoading(false);
  };

  const handleTogglePin = async (id: string, currentPinned: boolean) => {
    const { error } = await supabase
      .from('diary_entries')
      .update({ is_pinned: !currentPinned })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update pin status');
    } else {
      setEntries(entries.map(e => e.id === id ? { ...e, is_pinned: !currentPinned } : e)
        .sort((a, b) => {
          if (a.is_pinned !== b.is_pinned) return b.is_pinned ? 1 : -1;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }));
      toast.success(currentPinned ? 'Entry unpinned' : 'Entry pinned!');
    }
  };

  const handleCreateEntry = async () => {
    if (!newTitle.trim() || !newContent.trim()) {
      toast.error('Please fill in both title and content');
      return;
    }

    const { data, error } = await supabase
      .from('diary_entries')
      .insert({
        user_id: user?.id,
        title: newTitle.trim(),
        content: newContent.trim(),
        mood: newMood,
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to create entry');
    } else {
      setEntries([data, ...entries]);
      setNewTitle('');
      setNewContent('');
      setNewMood('neutral');
      setShowNewEntry(false);
      toast.success('Entry saved to the cosmos!');
    }
  };

  const handleUpdateEntry = async (id: string, title: string, content: string, mood: string) => {
    const { error } = await supabase
      .from('diary_entries')
      .update({ title, content, mood })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update entry');
    } else {
      setEntries(entries.map(e => e.id === id ? { ...e, title, content, mood } : e));
      setEditingId(null);
      toast.success('Entry updated!');
    }
  };

  const handleDeleteEntry = async (id: string) => {
    const { error } = await supabase
      .from('diary_entries')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete entry');
    } else {
      setEntries(entries.filter(e => e.id !== id));
      toast.success('Entry deleted');
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
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-display text-foreground mb-4">
              {t('diary.title')}
            </h1>
            <p className="text-muted-foreground">
              Your private space to write your thoughts among the stars
            </p>
          </motion.div>

          {/* New Entry Button */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {!showNewEntry ? (
              <Button
                onClick={() => setShowNewEntry(true)}
                className="w-full py-6 bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 gap-2"
              >
                <Plus className="w-5 h-5" />
                {t('diary.new_entry')}
              </Button>
            ) : (
              <motion.div
                className="glass-card rounded-xl p-6"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Input
                  placeholder="Entry title..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="mb-4 bg-secondary/50 border-border text-lg font-display"
                />
                
                <Textarea
                  placeholder="Write your thoughts..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="mb-4 bg-secondary/50 border-border min-h-[200px]"
                />

                {/* Mood Selector */}
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-muted-foreground text-sm">{t('diary.mood')}:</span>
                  <div className="flex gap-2">
                    {Object.entries(moodIcons).map(([mood, { icon: Icon, color }]) => (
                      <button
                        key={mood}
                        onClick={() => setNewMood(mood)}
                        className={`p-2 rounded-lg transition-all ${
                          newMood === mood ? 'bg-secondary scale-110' : 'hover:bg-secondary/50'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${color}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleCreateEntry}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {t('diary.save')}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowNewEntry(false);
                      setNewTitle('');
                      setNewContent('');
                    }}
                    className="gap-2"
                  >
                    <X className="w-4 h-4" />
                    {t('common.cancel')}
                  </Button>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Entries List */}
          <AnimatePresence>
            {entries.length === 0 && !showNewEntry ? (
              <motion.div
                className="text-center py-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <PenTool className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-display text-foreground mb-2">{t('diary.empty')}</h3>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {entries.map((entry, index) => (
                  <DiaryEntryCard
                    key={entry.id}
                    entry={entry}
                    index={index}
                    isEditing={editingId === entry.id}
                    onEdit={() => setEditingId(entry.id)}
                    onCancelEdit={() => setEditingId(null)}
                    onSave={(title, content, mood) => handleUpdateEntry(entry.id, title, content, mood)}
                    onDelete={() => handleDeleteEntry(entry.id)}
                    onTogglePin={() => handleTogglePin(entry.id, entry.is_pinned)}
                    t={t}
                  />
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </MainLayout>
  );
}

// Diary Entry Card Component
interface DiaryEntryCardProps {
  entry: DiaryEntry;
  index: number;
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSave: (title: string, content: string, mood: string) => void;
  onDelete: () => void;
  onTogglePin: () => void;
  t: (key: string) => string;
}

function DiaryEntryCard({ entry, index, isEditing, onEdit, onCancelEdit, onSave, onDelete, onTogglePin, t }: DiaryEntryCardProps) {
  const [editTitle, setEditTitle] = useState(entry.title);
  const [editContent, setEditContent] = useState(entry.content);
  const [editMood, setEditMood] = useState(entry.mood || 'neutral');

  const MoodIcon = entry.mood && moodIcons[entry.mood as keyof typeof moodIcons]?.icon;
  const moodColor = entry.mood && moodIcons[entry.mood as keyof typeof moodIcons]?.color;

  return (
    <motion.div
      className={`glass-card rounded-xl p-6 ${entry.is_pinned ? 'ring-2 ring-primary/50' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.05 }}
    >
      {isEditing ? (
        <>
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="mb-4 bg-secondary/50 border-border text-lg font-display"
          />
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="mb-4 bg-secondary/50 border-border min-h-[150px]"
          />
          <div className="flex items-center gap-4 mb-4">
            <span className="text-muted-foreground text-sm">{t('diary.mood')}:</span>
            <div className="flex gap-2">
              {Object.entries(moodIcons).map(([mood, { icon: Icon, color }]) => (
                <button
                  key={mood}
                  onClick={() => setEditMood(mood)}
                  className={`p-2 rounded-lg transition-all ${
                    editMood === mood ? 'bg-secondary scale-110' : 'hover:bg-secondary/50'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${color}`} />
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => onSave(editTitle, editContent, editMood)}
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
              size="sm"
            >
              <Save className="w-4 h-4" />
              {t('common.save')}
            </Button>
            <Button variant="ghost" onClick={onCancelEdit} size="sm">
              {t('common.cancel')}
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {MoodIcon && <MoodIcon className={`w-4 h-4 ${moodColor}`} />}
                <h3 className="text-xl font-display text-foreground">{entry.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                {format(new Date(entry.created_at), 'MMMM d, yyyy • h:mm a')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onTogglePin}
                className={entry.is_pinned ? 'text-primary' : ''}
                title={entry.is_pinned ? 'Unpin entry' : 'Pin entry'}
              >
                <Pin className={`w-4 h-4 ${entry.is_pinned ? 'fill-current' : ''}`} />
              </Button>
              <Button variant="ghost" size="icon" onClick={onEdit}>
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onDelete}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <p className="text-foreground/80 whitespace-pre-wrap">{entry.content}</p>
        </>
      )}
    </motion.div>
  );
}
