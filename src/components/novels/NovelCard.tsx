import { motion } from 'framer-motion';
import { BookOpen, Eye, User } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface NovelCardProps {
  novel: {
    id: string;
    title: string;
    description: string;
    coverUrl: string | null;
    genre: string;
    views: number;
    chapters: number;
    author: string;
  };
}

export function NovelCard({ novel }: NovelCardProps) {
  const { t } = useLanguage();

  return (
    <motion.div
      className="glass-card rounded-xl overflow-hidden group cursor-pointer"
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {/* Cover Image */}
      <div className="aspect-[3/4] relative bg-gradient-to-br from-secondary to-muted overflow-hidden">
        {novel.coverUrl ? (
          <img
            src={novel.coverUrl}
            alt={novel.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen className="w-16 h-16 text-primary/30" />
          </div>
        )}
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {/* Genre badge */}
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 text-xs font-medium rounded-full bg-primary/90 text-primary-foreground">
            {novel.genre}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-display text-lg text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors">
          {novel.title}
        </h3>
        
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {novel.description}
        </p>

        {/* Author */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <User className="w-3 h-3" />
          <span>{novel.author}</span>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            <span>{novel.chapters} {t('novels.chapters')}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            <span>{novel.views.toLocaleString()} {t('novels.views')}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
