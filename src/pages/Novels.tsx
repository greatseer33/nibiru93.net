import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, BookOpen, TrendingUp, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MainLayout } from '@/components/layout/MainLayout';
import { NovelCard } from '@/components/novels/NovelCard';
import { useLanguage } from '@/contexts/LanguageContext';

// Sample novels data
const allNovels = [
  {
    id: '1',
    title: 'The Eternal Wanderer',
    description: 'A tale of an immortal soul traveling through dimensions, seeking the meaning of existence.',
    coverUrl: null,
    genre: 'Fantasy',
    views: 12500,
    chapters: 145,
    author: 'StarWriter93',
  },
  {
    id: '2',
    title: 'Shadows of Tomorrow',
    description: 'In a world where time is currency, one woman dares to steal it all.',
    coverUrl: null,
    genre: 'Sci-Fi',
    views: 8700,
    chapters: 89,
    author: 'NightOwl',
  },
  {
    id: '3',
    title: 'Dragon Heart Chronicles',
    description: 'The last dragon rider awakens to a world that forgot magic.',
    coverUrl: null,
    genre: 'Epic Fantasy',
    views: 23400,
    chapters: 312,
    author: 'FirescaleWriter',
  },
  {
    id: '4',
    title: 'Crimson Moon Rising',
    description: 'When the blood moon rises, ancient powers awaken.',
    coverUrl: null,
    genre: 'Dark Fantasy',
    views: 15600,
    chapters: 178,
    author: 'MoonlightScribe',
  },
  {
    id: '5',
    title: 'Code of the Cyber Samurai',
    description: 'In neon-lit Tokyo 2099, honor still means everything.',
    coverUrl: null,
    genre: 'Cyberpunk',
    views: 9800,
    chapters: 67,
    author: 'NeonBlade',
  },
  {
    id: '6',
    title: 'The Alchemist\'s Daughter',
    description: 'She inherited her father\'s lab and his enemies.',
    coverUrl: null,
    genre: 'Historical Fantasy',
    views: 7200,
    chapters: 134,
    author: 'GoldenInk',
  },
];

const genres = ['All', 'Fantasy', 'Sci-Fi', 'Romance', 'Action', 'Mystery', 'Horror', 'Historical'];

export default function Novels() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [sortBy, setSortBy] = useState<'trending' | 'latest' | 'views'>('trending');
  const { t } = useLanguage();

  const filteredNovels = allNovels.filter((novel) => {
    const matchesSearch = novel.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      novel.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === 'All' || novel.genre.includes(selectedGenre);
    return matchesSearch && matchesGenre;
  });

  return (
    <MainLayout>
      <div className="min-h-screen py-24 px-4">
        <div className="container mx-auto">
          {/* Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-display text-foreground mb-4">
              {t('nav.novels')}
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore thousands of captivating stories from talented writers around the world
            </p>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            className="mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t('common.search') + '...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-6 text-lg bg-secondary/50 border-border"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Genre Filters */}
              <div className="flex flex-wrap justify-center gap-2">
                {genres.map((genre) => (
                  <Button
                    key={genre}
                    variant={selectedGenre === genre ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedGenre(genre)}
                    className={selectedGenre === genre 
                      ? 'bg-primary text-primary-foreground' 
                      : 'border-border text-muted-foreground hover:text-foreground hover:border-primary/50'
                    }
                  >
                    {genre}
                  </Button>
                ))}
              </div>

              {/* Sort Options */}
              <div className="flex items-center gap-2">
                <Button
                  variant={sortBy === 'trending' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSortBy('trending')}
                  className="gap-2"
                >
                  <TrendingUp className="w-4 h-4" />
                  {t('novels.trending')}
                </Button>
                <Button
                  variant={sortBy === 'latest' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSortBy('latest')}
                  className="gap-2"
                >
                  <Clock className="w-4 h-4" />
                  {t('novels.latest')}
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Novels Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredNovels.map((novel, index) => (
              <motion.div
                key={novel.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <NovelCard novel={novel} />
              </motion.div>
            ))}
          </div>

          {filteredNovels.length === 0 && (
            <motion.div
              className="text-center py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-display text-foreground mb-2">No novels found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </motion.div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
