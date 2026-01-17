import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, PenTool, User, LogOut, BookOpen, Shield, Users, Library } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();
  const { user, signOut } = useAuth();
  const { isAdmin } = useIsAdmin();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: t('nav.home'), icon: null },
    { to: '/community', label: 'Community', icon: Users },
    ...(user ? [
      { to: '/diary', label: t('nav.diary'), icon: PenTool },
      { to: '/stories', label: 'Stories', icon: BookOpen },
      { to: '/novels', label: 'Novels', icon: Library },
    ] : []),
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <motion.div
              className="text-xl md:text-2xl font-display text-primary gold-glow"
              whileHover={{ scale: 1.05 }}
            >
              Nibiru93
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="flex items-center gap-2 text-foreground/80 hover:text-primary transition-colors"
              >
                {link.icon && <link.icon className="w-4 h-4" />}
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-4">
            <LanguageSwitcher />
            
            {user ? (
              <div className="flex items-center gap-3">
                <Link to="/stories">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <BookOpen className="w-4 h-4" />
                    Stories
                  </Button>
                </Link>
                <Link to="/novels">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Library className="w-4 h-4" />
                    Novels
                  </Button>
                </Link>
                <Link to="/diary">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <PenTool className="w-4 h-4" />
                    {t('nav.diary')}
                  </Button>
                </Link>
                <Link to="/profile">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <User className="w-4 h-4" />
                    Profile
                  </Button>
                </Link>
                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="ghost" size="sm" className="gap-2 text-primary">
                      <Shield className="w-4 h-4" />
                      Admin
                    </Button>
                  </Link>
                )}
                <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2">
                  <LogOut className="w-4 h-4" />
                  {t('nav.logout')}
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/auth">
                  <Button variant="ghost" size="sm">
                    {t('nav.signin')}
                  </Button>
                </Link>
                <Link to="/auth?mode=signup">
                  <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    {t('nav.signup')}
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden py-4 border-t border-border"
            >
              <div className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="flex items-center gap-2 px-2 py-2 text-foreground/80 hover:text-primary transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.icon && <link.icon className="w-4 h-4" />}
                    {link.label}
                  </Link>
                ))}
                
                <div className="border-t border-border pt-4 mt-2">
                  <LanguageSwitcher />
                </div>

                {user ? (
                  <div className="flex flex-col gap-2 pt-2">
                    <Link to="/stories" onClick={() => setIsOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                        <BookOpen className="w-4 h-4" />
                        Stories
                      </Button>
                    </Link>
                    <Link to="/novels" onClick={() => setIsOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                        <Library className="w-4 h-4" />
                        Novels
                      </Button>
                    </Link>
                    <Link to="/diary" onClick={() => setIsOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                        <PenTool className="w-4 h-4" />
                        {t('nav.diary')}
                      </Button>
                    </Link>
                    <Link to="/profile" onClick={() => setIsOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                        <User className="w-4 h-4" />
                        Profile
                      </Button>
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setIsOpen(false)}>
                        <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-primary">
                          <Shield className="w-4 h-4" />
                          Admin
                        </Button>
                      </Link>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        handleSignOut();
                        setIsOpen(false);
                      }}
                      className="w-full justify-start gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      {t('nav.logout')}
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 pt-2">
                    <Link to="/auth" onClick={() => setIsOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full">
                        {t('nav.signin')}
                      </Button>
                    </Link>
                    <Link to="/auth?mode=signup" onClick={() => setIsOpen(false)}>
                      <Button size="sm" className="w-full bg-primary text-primary-foreground">
                        {t('nav.signup')}
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
