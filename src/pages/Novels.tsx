import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, BookOpen, Trash2, Edit2, Image, Eye, Loader2, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MainLayout } from '@/components/layout/MainLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Novel {
  id: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  genre: string | null;
  status: string | null;
  language: string | null;
  views: number | null;
  author_id: string;
  created_at: string | null;
  updated_at: string | null;
}

interface Chapter {
  id: string;
  novel_id: string;
  title: string;
  content: string;
  chapter_number: number;
  published: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

const GENRES = [
  'Fantasy', 'Romance', 'Action', 'Adventure', 'Mystery', 
  'Sci-Fi', 'Horror', 'Comedy', 'Drama', 'Slice of Life'
];

const STATUSES = ['Ongoing', 'Completed', 'Hiatus'];

export default function Novels() {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeNovel, setActiveNovel] = useState<Novel | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [activeChapter, setActiveChapter] = useState<Chapter | null>(null);
  const [showNewNovel, setShowNewNovel] = useState(false);
  const [showNewChapter, setShowNewChapter] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Novel form
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newGenre, setNewGenre] = useState('');
  const [newStatus, setNewStatus] = useState('Ongoing');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  // Chapter form
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterContent, setChapterContent] = useState('');
  const [editingChapter, setEditingChapter] = useState(false);

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
      fetchNovels();
    }
  }, [user]);

  useEffect(() => {
    if (activeNovel) {
      fetchChapters(activeNovel.id);
    }
  }, [activeNovel]);

  const fetchNovels = async () => {
    const { data, error } = await supabase
      .from('novels')
      .select('*')
      .eq('author_id', user?.id)
      .order('updated_at', { ascending: false });

    if (error) {
      toast.error('Failed to load novels');
    } else {
      setNovels(data || []);
    }
    setLoading(false);
  };

  const fetchChapters = async (novelId: string) => {
    const { data, error } = await supabase
      .from('chapters')
      .select('*')
      .eq('novel_id', novelId)
      .order('chapter_number', { ascending: true });

    if (error) {
      toast.error('Failed to load chapters');
    } else {
      setChapters(data || []);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Cover image must be less than 5MB');
        return;
      }
      setCoverFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setCoverPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const uploadCover = async (novelId: string): Promise<string | null> => {
    if (!coverFile || !user) return null;

    const fileExt = coverFile.name.split('.').pop();
    const fileName = `${user.id}/${novelId}.${fileExt}`;

    const { error } = await supabase.storage
      .from('novel-covers')
      .upload(fileName, coverFile, { upsert: true });

    if (error) {
      console.error('Cover upload error:', error);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('novel-covers')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  };

  const handleCreateNovel = async () => {
    if (!newTitle.trim()) {
      toast.error('Please enter a title');
      return;
    }

    setSaving(true);

    // First create the novel without cover
    const { data, error } = await supabase
      .from('novels')
      .insert({
        author_id: user?.id,
        title: newTitle.trim(),
        description: newDescription.trim() || null,
        genre: newGenre || null,
        status: newStatus,
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to create novel');
      setSaving(false);
      return;
    }

    // Upload cover if provided
    if (coverFile && data) {
      setUploading(true);
      const coverUrl = await uploadCover(data.id);
      if (coverUrl) {
        await supabase
          .from('novels')
          .update({ cover_url: coverUrl })
          .eq('id', data.id);
        data.cover_url = coverUrl;
      }
      setUploading(false);
    }

    setNovels(prev => [data, ...prev]);
    resetNovelForm();
    setActiveNovel(data);
    toast.success('Novel created!');
    setSaving(false);
  };

  const resetNovelForm = () => {
    setNewTitle('');
    setNewDescription('');
    setNewGenre('');
    setNewStatus('Ongoing');
    setCoverFile(null);
    setCoverPreview(null);
    setShowNewNovel(false);
  };

  const handleCreateChapter = async () => {
    if (!chapterTitle.trim() || !activeNovel) {
      toast.error('Please enter a chapter title');
      return;
    }

    const nextChapterNumber = chapters.length + 1;

    const { data, error } = await supabase
      .from('chapters')
      .insert({
        novel_id: activeNovel.id,
        title: chapterTitle.trim(),
        content: chapterContent,
        chapter_number: nextChapterNumber,
        published: false,
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to create chapter');
    } else {
      setChapters(prev => [...prev, data]);
      setChapterTitle('');
      setChapterContent('');
      setShowNewChapter(false);
      setActiveChapter(data);
      setEditingChapter(true);
      toast.success('Chapter created!');
    }
  };

  const handleSaveChapter = async () => {
    if (!activeChapter) return;

    setSaving(true);
    const { error } = await supabase
      .from('chapters')
      .update({
        title: chapterTitle,
        content: chapterContent,
      })
      .eq('id', activeChapter.id);

    if (error) {
      toast.error('Failed to save chapter');
    } else {
      setChapters(prev => prev.map(ch => 
        ch.id === activeChapter.id ? { ...ch, title: chapterTitle, content: chapterContent } : ch
      ));
      toast.success('Chapter saved!');
    }
    setSaving(false);
  };

  const handlePublishChapter = async (chapter: Chapter) => {
    const { error } = await supabase
      .from('chapters')
      .update({ published: !chapter.published })
      .eq('id', chapter.id);

    if (error) {
      toast.error('Failed to update chapter');
    } else {
      setChapters(prev => prev.map(ch => 
        ch.id === chapter.id ? { ...ch, published: !ch.published } : ch
      ));
      toast.success(chapter.published ? 'Chapter unpublished' : 'Chapter published!');
    }
  };

  const handleDeleteNovel = async (id: string) => {
    const { error } = await supabase
      .from('novels')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete novel');
    } else {
      setNovels(prev => prev.filter(n => n.id !== id));
      if (activeNovel?.id === id) {
        setActiveNovel(null);
        setChapters([]);
      }
      toast.success('Novel deleted');
    }
  };

  const handleDeleteChapter = async (id: string) => {
    const { error } = await supabase
      .from('chapters')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete chapter');
    } else {
      setChapters(prev => prev.filter(ch => ch.id !== id));
      if (activeChapter?.id === id) {
        setActiveChapter(null);
        setEditingChapter(false);
      }
      toast.success('Chapter deleted');
    }
  };

  const openChapterEditor = (chapter: Chapter) => {
    setActiveChapter(chapter);
    setChapterTitle(chapter.title);
    setChapterContent(chapter.content);
    setEditingChapter(true);
  };

  const closeChapterEditor = () => {
    setActiveChapter(null);
    setChapterTitle('');
    setChapterContent('');
    setEditingChapter(false);
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

  // Chapter Editor View
  if (editingChapter && activeChapter) {
    return (
      <MainLayout>
        <div className="min-h-screen py-24 px-4">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              className="glass-card rounded-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Editor Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/50">
                <Button variant="ghost" onClick={closeChapterEditor} className="gap-2">
                  ← Back to Chapters
                </Button>
                <div className="flex items-center gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <Button onClick={handleSaveChapter} className="gap-2 bg-primary text-primary-foreground">
                    Save Chapter
                  </Button>
                </div>
              </div>

              {/* Chapter Title */}
              <Input
                value={chapterTitle}
                onChange={(e) => setChapterTitle(e.target.value)}
                className="text-2xl font-display bg-transparent border-none mb-6 focus-visible:ring-0"
                placeholder="Chapter title..."
              />

              {/* Chapter Content */}
              <Textarea
                value={chapterContent}
                onChange={(e) => setChapterContent(e.target.value)}
                className="w-full min-h-[500px] bg-secondary/30 border-border resize-none text-foreground/90 leading-relaxed"
                placeholder="Write your chapter content here..."
              />

              {/* Word Count */}
              <div className="flex justify-between mt-4 text-sm text-muted-foreground">
                <span>{chapterContent.split(/\s+/).filter(Boolean).length} words</span>
                <span>{chapterContent.length} characters</span>
              </div>
            </motion.div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Novel Detail View (Chapters List)
  if (activeNovel) {
    return (
      <MainLayout>
        <div className="min-h-screen py-24 px-4">
          <div className="container mx-auto max-w-6xl">
            {/* Back Button */}
            <Button variant="ghost" onClick={() => setActiveNovel(null)} className="mb-6 gap-2">
              ← Back to Novels
            </Button>

            {/* Novel Header */}
            <motion.div
              className="glass-card rounded-xl p-6 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex flex-col md:flex-row gap-6">
                {/* Cover Image */}
                <div className="w-full md:w-48 flex-shrink-0">
                  {activeNovel.cover_url ? (
                    <img
                      src={activeNovel.cover_url}
                      alt={activeNovel.title}
                      className="w-full h-64 md:h-72 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-64 md:h-72 bg-secondary/50 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Novel Info */}
                <div className="flex-1">
                  <h1 className="text-3xl font-display text-foreground mb-2">{activeNovel.title}</h1>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {activeNovel.genre && (
                      <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm">
                        {activeNovel.genre}
                      </span>
                    )}
                    {activeNovel.status && (
                      <span className="px-3 py-1 bg-secondary text-muted-foreground rounded-full text-sm">
                        {activeNovel.status}
                      </span>
                    )}
                  </div>
                  {activeNovel.description && (
                    <p className="text-muted-foreground mb-4">{activeNovel.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {activeNovel.views || 0} views
                    </span>
                    <span>{chapters.length} chapters</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Chapters Section */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display text-foreground">Chapters</h2>
              <Button onClick={() => setShowNewChapter(true)} className="gap-2 bg-primary text-primary-foreground">
                <Plus className="w-4 h-4" />
                Add Chapter
              </Button>
            </div>

            {/* New Chapter Dialog */}
            <Dialog open={showNewChapter} onOpenChange={setShowNewChapter}>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="font-display">New Chapter</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <Input
                    placeholder="Chapter title..."
                    value={chapterTitle}
                    onChange={(e) => setChapterTitle(e.target.value)}
                    className="bg-secondary/50 border-border"
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => setShowNewChapter(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateChapter} className="bg-primary text-primary-foreground">
                      Create Chapter
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Chapters List */}
            <motion.div className="space-y-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {chapters.length === 0 ? (
                <div className="glass-card rounded-xl p-12 text-center">
                  <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-display text-foreground mb-2">No Chapters Yet</h3>
                  <p className="text-muted-foreground mb-4">Start writing your first chapter</p>
                  <Button onClick={() => setShowNewChapter(true)} className="gap-2 bg-primary text-primary-foreground">
                    <Plus className="w-4 h-4" />
                    Add First Chapter
                  </Button>
                </div>
              ) : (
                chapters.map((chapter, index) => (
                  <motion.div
                    key={chapter.id}
                    className="glass-card rounded-lg p-4 flex items-center justify-between gap-4 hover:border-primary/50 transition-all cursor-pointer"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => openChapterEditor(chapter)}
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <span className="text-2xl font-display text-primary w-12 text-center flex-shrink-0">
                        {chapter.chapter_number}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display text-foreground truncate">{chapter.title}</h3>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{chapter.content.split(/\s+/).filter(Boolean).length} words</span>
                          {chapter.updated_at && (
                            <span>{format(new Date(chapter.updated_at), 'MMM d, yyyy')}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePublishChapter(chapter)}
                        className={chapter.published ? 'text-green-400' : 'text-muted-foreground'}
                      >
                        {chapter.published ? 'Published' : 'Draft'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openChapterEditor(chapter)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteChapter(chapter.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Novels List View
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
              My Novels
            </h1>
            <p className="text-muted-foreground">
              Create and manage your web novels with chapters
            </p>
          </motion.div>

          {/* New Novel Button */}
          <div className="mb-8">
            <Dialog open={showNewNovel} onOpenChange={setShowNewNovel}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                  <Plus className="w-5 h-5" />
                  Create New Novel
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border max-w-lg">
                <DialogHeader>
                  <DialogTitle className="font-display text-xl">Create New Novel</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  {/* Cover Upload */}
                  <div className="flex justify-center">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverChange}
                        className="hidden"
                      />
                      {coverPreview ? (
                        <img
                          src={coverPreview}
                          alt="Cover preview"
                          className="w-32 h-44 object-cover rounded-lg border-2 border-dashed border-primary/50 hover:border-primary transition-colors"
                        />
                      ) : (
                        <div className="w-32 h-44 bg-secondary/50 rounded-lg border-2 border-dashed border-border hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-2">
                          <Image className="w-8 h-8 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Add Cover</span>
                        </div>
                      )}
                    </label>
                  </div>

                  <Input
                    placeholder="Novel title..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="bg-secondary/50 border-border"
                  />

                  <Textarea
                    placeholder="Description (optional)..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="bg-secondary/50 border-border resize-none"
                    rows={3}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Select value={newGenre} onValueChange={setNewGenre}>
                      <SelectTrigger className="bg-secondary/50 border-border">
                        <SelectValue placeholder="Genre" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        {GENRES.map(genre => (
                          <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={newStatus} onValueChange={setNewStatus}>
                      <SelectTrigger className="bg-secondary/50 border-border">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        {STATUSES.map(status => (
                          <SelectItem key={status} value={status}>{status}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="ghost" onClick={resetNovelForm}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleCreateNovel} 
                      disabled={saving || uploading}
                      className="gap-2 bg-primary text-primary-foreground"
                    >
                      {(saving || uploading) && <Loader2 className="w-4 h-4 animate-spin" />}
                      Create Novel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Novels Grid */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <AnimatePresence>
              {novels.length === 0 ? (
                <div className="col-span-full">
                  <motion.div
                    className="glass-card rounded-xl p-12 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-display text-foreground mb-2">No Novels Yet</h3>
                    <p className="text-muted-foreground">Create your first novel to start writing</p>
                  </motion.div>
                </div>
              ) : (
                novels.map((novel, index) => (
                  <motion.div
                    key={novel.id}
                    className="group cursor-pointer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setActiveNovel(novel)}
                  >
                    <div className="relative aspect-[3/4] rounded-lg overflow-hidden mb-3 border border-border/50 group-hover:border-primary/50 transition-all">
                      {novel.cover_url ? (
                        <img
                          src={novel.cover_url}
                          alt={novel.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-secondary to-background flex items-center justify-center">
                          <BookOpen className="w-12 h-12 text-muted-foreground" />
                        </div>
                      )}
                      
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                        <Button size="sm" variant="secondary" className="gap-1">
                          <Edit2 className="w-3 h-3" />
                          Manage
                        </Button>
                      </div>

                      {/* Delete button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 hover:bg-destructive hover:text-destructive-foreground h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNovel(novel.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>

                      {/* Status badge */}
                      {novel.status && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 bg-background/80 text-xs rounded">
                          {novel.status}
                        </span>
                      )}
                    </div>

                    <h3 className="font-display text-foreground truncate group-hover:text-primary transition-colors">
                      {novel.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {novel.genre && <span>{novel.genre}</span>}
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
}
