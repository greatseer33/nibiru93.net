import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, PenTool, Sparkles, Users, Star, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MainLayout } from '@/components/layout/MainLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { NovelCard } from '@/components/novels/NovelCard';

// Sample featured novels data
const featuredNovels = [
  {
    id: '1',
    title: 'The Eternal Wanderer',
    description: 'A tale of an immortal soul traveling through dimensions...',
    coverUrl: null,
    genre: 'Fantasy',
    views: 12500,
    chapters: 145,
    author: 'StarWriter93',
  },
  {
    id: '2',
    title: 'Shadows of Tomorrow',
    description: 'In a world where time is currency, one woman dares to steal it all...',
    coverUrl: null,
    genre: 'Sci-Fi',
    views: 8700,
    chapters: 89,
    author: 'NightOwl',
  },
  {
    id: '3',
    title: 'Dragon Heart Chronicles',
    description: 'The last dragon rider awakens to a world that forgot magic...',
    coverUrl: null,
    genre: 'Epic Fantasy',
    views: 23400,
    chapters: 312,
    author: 'FirescaleWriter',
  },
];

export default function Index() {
  const { t } = useLanguage();

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Nebula Background Effect */}
        <div className="absolute inset-0 bg-nebula-gradient opacity-30" />
        
        <div className="container mx-auto px-4 py-20">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border mb-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Welcome to the Cosmos</span>
            </motion.div>

            <motion.h1
              className="text-5xl md:text-7xl lg:text-8xl font-display text-primary gold-glow mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {t('hero.title')}
            </motion.h1>

            <motion.p
              className="text-2xl md:text-3xl font-display text-foreground/90 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {t('hero.subtitle')}
            </motion.p>

            <motion.p
              className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {t('hero.description')}
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Link to="/novels">
                <Button size="lg" className="gap-2 text-lg px-8 py-6 bg-primary text-primary-foreground hover:bg-primary/90 animate-glow-pulse">
                  <BookOpen className="w-5 h-5" />
                  {t('hero.explore')}
                </Button>
              </Link>
              <Link to="/auth?mode=signup">
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 text-lg px-8 py-6 border-primary/50 text-primary hover:bg-primary/10"
                >
                  <PenTool className="w-5 h-5" />
                  {t('hero.start_writing')}
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-primary/30 flex items-start justify-center p-2">
            <motion.div
              className="w-1 h-2 rounded-full bg-primary"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-border/50">
        <div className="container mx-auto px-4">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {[
              { icon: BookOpen, value: '10K+', label: 'Novels' },
              { icon: Users, value: '50K+', label: 'Writers' },
              { icon: Star, value: '1M+', label: 'Chapters' },
              { icon: TrendingUp, value: '5M+', label: 'Readers' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <div className="text-3xl font-display text-foreground mb-1">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Novels Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-display text-foreground mb-4">
              {t('novels.featured')}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover the most captivating stories from our community of talented writers
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredNovels.map((novel, index) => (
              <motion.div
                key={novel.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <NovelCard novel={novel} />
              </motion.div>
            ))}
          </div>

          <motion.div
            className="text-center mt-10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Link to="/novels">
              <Button variant="outline" size="lg" className="border-primary/50 text-primary hover:bg-primary/10">
                View All Novels
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5" />
        <div className="container mx-auto px-4 relative">
          <motion.div
            className="glass-card rounded-2xl p-10 md:p-16 text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-display text-foreground mb-4">
              Start Your Cosmic Journey
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Join thousands of writers and readers in the most immersive webnovel platform. Your story awaits among the stars.
            </p>
            <Link to="/auth?mode=signup">
              <Button size="lg" className="px-8 py-6 text-lg bg-primary text-primary-foreground hover:bg-primary/90">
                Create Free Account
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-2xl font-display text-primary gold-glow">Nibiru93.net</div>
            <p className="text-muted-foreground text-sm">
              © 2024 Nibiru93.net. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </MainLayout>
  );
}
