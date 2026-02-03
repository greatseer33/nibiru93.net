import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Heart, Eye, Feather, Search, X, Globe, Lock, Trash2 } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Poem {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: string;
  is_public: boolean;
  views: number;
  created_at: string;
  profiles?: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
  likes_count?: number;
  user_liked?: boolean;
}

const CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'love', label: 'Love' },
  { value: 'nature', label: 'Nature' },
  { value: 'life', label: 'Life' },
  { value: 'spiritual', label: 'Spiritual' },
  { value: 'sad', label: 'Sad' },
  { value: 'inspirational', label: 'Inspirational' },
  { value: 'funny', label: 'Funny' },
];

export default function Poetry() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [poems, setPoems] = useState<Poem[]>([]);
  const [myPoems, setMyPoems] = useState<Poem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPoem, setSelectedPoem] = useState<Poem | null>(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');
  const [isPublic, setIsPublic] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPoems();
    if (user) {
      fetchMyPoems();
    }
  }, [user]);

  const fetchPoems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('poems')
      .select(`
        *,
        profiles:user_id (username, display_name, avatar_url)
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching poems:', error);
    } else {
      // Fetch likes for each poem
      const poemsWithLikes = await Promise.all(
        (data || []).map(async (poem) => {
          const { count } = await supabase
            .from('poem_likes')
            .select('*', { count: 'exact', head: true })
            .eq('poem_id', poem.id);
          
          let userLiked = false;
          if (user) {
            const { data: likeData } = await supabase
              .from('poem_likes')
              .select('id')
              .eq('poem_id', poem.id)
              .eq('user_id', user.id)
              .maybeSingle();
            userLiked = !!likeData;
          }
          
          return {
            ...poem,
            likes_count: count || 0,
            user_liked: userLiked,
          };
        })
      );
      setPoems(poemsWithLikes);
    }
    setLoading(false);
  };

  const fetchMyPoems = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('poems')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching my poems:', error);
    } else {
      setMyPoems(data || []);
    }
  };

  const handleCreate = async () => {
    if (!user || !title.trim() || !content.trim()) return;
    
    setSaving(true);
    const { error } = await supabase.from('poems').insert({
      user_id: user.id,
      title: title.trim(),
      content: content.trim(),
      category,
      is_public: isPublic,
    });

    if (error) {
      toast({ title: 'Error', description: 'Failed to create poem', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Poem created!' });
      setTitle('');
      setContent('');
      setCategory('general');
      setIsPublic(true);
      setIsCreateOpen(false);
      fetchPoems();
      fetchMyPoems();
    }
    setSaving(false);
  };

  const handleLike = async (poemId: string, currentlyLiked: boolean) => {
    if (!user) {
      toast({ title: 'Sign in required', description: 'Please sign in to like poems' });
      return;
    }

    if (currentlyLiked) {
      await supabase
        .from('poem_likes')
        .delete()
        .eq('poem_id', poemId)
        .eq('user_id', user.id);
    } else {
      await supabase.from('poem_likes').insert({
        poem_id: poemId,
        user_id: user.id,
      });
    }
    
    fetchPoems();
  };

  const handleDelete = async (poemId: string) => {
    const { error } = await supabase.from('poems').delete().eq('id', poemId);
    
    if (error) {
      toast({ title: 'Error', description: 'Failed to delete poem', variant: 'destructive' });
    } else {
      toast({ title: 'Deleted', description: 'Poem deleted' });
      fetchPoems();
      fetchMyPoems();
      setSelectedPoem(null);
    }
  };

  const filteredPoems = poems.filter((poem) => {
    const matchesCategory = selectedCategory === 'all' || poem.category === selectedCategory;
    const matchesSearch = poem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         poem.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border mb-4">
            <Feather className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Poetry Hub</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display text-primary gold-glow mb-4">
            Poetry Hub
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Express your soul through verse. Write, share, and discover beautiful poetry from our community.
          </p>
        </motion.div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search poems..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card border-border"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-48 bg-card border-border">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {user && (
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                  <Plus className="w-4 h-4" />
                  Write Poem
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Feather className="w-5 h-5 text-primary" />
                    Write a Poem
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Title</Label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Your poem's title"
                      className="bg-background border-border"
                    />
                  </div>
                  <div>
                    <Label>Content</Label>
                    <Textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Let your words flow..."
                      rows={8}
                      className="bg-background border-border font-serif"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Category</Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="bg-background border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={isPublic}
                          onCheckedChange={setIsPublic}
                          id="public"
                        />
                        <Label htmlFor="public" className="flex items-center gap-1">
                          {isPublic ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                          {isPublic ? 'Public' : 'Private'}
                        </Label>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={handleCreate}
                    disabled={saving || !title.trim() || !content.trim()}
                    className="w-full bg-primary text-primary-foreground"
                  >
                    {saving ? 'Publishing...' : 'Publish Poem'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="discover" className="space-y-6">
          <TabsList className="bg-secondary/50">
            <TabsTrigger value="discover">Discover</TabsTrigger>
            {user && <TabsTrigger value="my-poems">My Poems</TabsTrigger>}
          </TabsList>

          <TabsContent value="discover">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading poems...</div>
            ) : filteredPoems.length === 0 ? (
              <div className="text-center py-12">
                <Feather className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">No poems found. Be the first to write one!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPoems.map((poem) => (
                  <motion.div
                    key={poem.id}
                    className="glass-card rounded-xl p-6 cursor-pointer hover:border-primary/50 transition-colors"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -4 }}
                    onClick={() => setSelectedPoem(poem)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary capitalize">
                        {poem.category}
                      </span>
                      <div className="flex items-center gap-3 text-muted-foreground text-sm">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {poem.views}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLike(poem.id, poem.user_liked || false);
                          }}
                          className={`flex items-center gap-1 transition-colors ${
                            poem.user_liked ? 'text-red-500' : 'hover:text-red-500'
                          }`}
                        >
                          <Heart className={`w-3 h-3 ${poem.user_liked ? 'fill-current' : ''}`} />
                          {poem.likes_count}
                        </button>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-display text-foreground mb-2">{poem.title}</h3>
                    <p className="text-muted-foreground text-sm line-clamp-4 font-serif italic whitespace-pre-line">
                      {poem.content}
                    </p>
                    
                    <div className="mt-4 pt-4 border-t border-border flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs text-primary">
                        {poem.profiles?.display_name?.[0] || poem.profiles?.username?.[0] || '?'}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {poem.profiles?.display_name || poem.profiles?.username}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {user && (
            <TabsContent value="my-poems">
              {myPoems.length === 0 ? (
                <div className="text-center py-12">
                  <Feather className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">You haven't written any poems yet.</p>
                  <Button
                    onClick={() => setIsCreateOpen(true)}
                    className="mt-4 gap-2 bg-primary text-primary-foreground"
                  >
                    <Plus className="w-4 h-4" />
                    Write Your First Poem
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myPoems.map((poem) => (
                    <motion.div
                      key={poem.id}
                      className="glass-card rounded-xl p-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary capitalize">
                            {poem.category}
                          </span>
                          {poem.is_public ? (
                            <Globe className="w-3 h-3 text-muted-foreground" />
                          ) : (
                            <Lock className="w-3 h-3 text-muted-foreground" />
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(poem.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <h3 className="text-lg font-display text-foreground mb-2">{poem.title}</h3>
                      <p className="text-muted-foreground text-sm line-clamp-4 font-serif italic whitespace-pre-line">
                        {poem.content}
                      </p>
                      
                      <div className="mt-4 pt-4 border-t border-border flex items-center gap-3 text-muted-foreground text-sm">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {poem.views} views
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>

        {/* Poem Detail Modal */}
        <AnimatePresence>
          {selectedPoem && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPoem(null)}
            >
              <motion.div
                className="glass-card rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary capitalize">
                      {selectedPoem.category}
                    </span>
                    <h2 className="text-2xl md:text-3xl font-display text-foreground mt-3">
                      {selectedPoem.title}
                    </h2>
                    <p className="text-muted-foreground text-sm mt-1">
                      by {selectedPoem.profiles?.display_name || selectedPoem.profiles?.username}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedPoem(null)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                
                <div className="prose prose-invert max-w-none">
                  <p className="text-foreground/90 font-serif text-lg leading-relaxed whitespace-pre-line italic">
                    {selectedPoem.content}
                  </p>
                </div>
                
                <div className="mt-8 pt-6 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {selectedPoem.views} views
                    </span>
                    <button
                      onClick={() => handleLike(selectedPoem.id, selectedPoem.user_liked || false)}
                      className={`flex items-center gap-1 transition-colors ${
                        selectedPoem.user_liked ? 'text-red-500' : 'hover:text-red-500'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${selectedPoem.user_liked ? 'fill-current' : ''}`} />
                      {selectedPoem.likes_count} likes
                    </button>
                  </div>
                  <span className="text-muted-foreground text-sm">
                    {new Date(selectedPoem.created_at).toLocaleDateString()}
                  </span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MainLayout>
  );
}
