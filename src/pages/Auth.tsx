import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, Check, X, ArrowLeft } from 'lucide-react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { MainLayout } from '@/components/layout/MainLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="currentColor"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="currentColor"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="currentColor"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

// Password validation schema
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

const emailSchema = z.string().email('Invalid email address');

type AuthMode = 'signin' | 'signup' | 'forgot' | 'reset';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 
                      searchParams.get('mode') === 'reset' ? 'reset' : 'signin';
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const { t } = useLanguage();
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in (except for reset mode)
  useEffect(() => {
    if (user && mode !== 'reset') {
      navigate('/');
    }
  }, [user, mode, navigate]);

  const isSignUp = mode === 'signup';
  const isForgot = mode === 'forgot';
  const isReset = mode === 'reset';

  // Password strength indicators
  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (isForgot) {
      try {
        emailSchema.parse(email);
      } catch (e) {
        newErrors.email = 'Invalid email address';
      }
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    }

    if (isReset) {
      try {
        passwordSchema.parse(password);
      } catch (e) {
        newErrors.password = t('auth.password_requirements');
      }
      if (password !== confirmPassword) {
        newErrors.confirmPassword = t('auth.passwords_not_match');
      }
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    }

    // Validate email
    try {
      emailSchema.parse(email);
    } catch (e) {
      newErrors.email = 'Invalid email address';
    }

    // Validate password
    try {
      passwordSchema.parse(password);
    } catch (e) {
      newErrors.password = t('auth.password_requirements');
    }

    if (isSignUp) {
      if (password !== confirmPassword) {
        newErrors.confirmPassword = t('auth.passwords_not_match');
      }
      if (!username.trim()) {
        newErrors.username = 'Username is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleForgotPassword = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?mode=reset`,
      });
      
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Password reset email sent! Check your inbox.');
        setMode('signin');
      }
    } catch (error) {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Password updated successfully!');
        navigate('/');
      }
    } catch (error) {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      
      if (error) {
        toast.error(error.message);
      }
    } catch (error) {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isForgot) {
      return handleForgotPassword();
    }
    
    if (isReset) {
      return handleResetPassword();
    }
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, username, displayName);
        if (error) {
          if (error.message.includes('already registered')) {
            toast.error('This email is already registered. Please sign in.');
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success('Account created successfully! Welcome to Nibiru93.');
          navigate('/');
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error('Invalid email or password. Please try again.');
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success('Welcome back!');
          navigate('/');
        }
      }
    } catch (error) {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getHeaderText = () => {
    if (isForgot) return { title: 'Reset Password', subtitle: 'Enter your email to receive a reset link' };
    if (isReset) return { title: 'Set New Password', subtitle: 'Choose a strong password for your account' };
    if (isSignUp) return { title: t('auth.join_us'), subtitle: 'Create your account to start writing' };
    return { title: t('auth.welcome_back'), subtitle: 'Sign in to continue your journey' };
  };

  const headerText = getHeaderText();

  return (
    <MainLayout>
      <div className="min-h-screen flex items-center justify-center py-20 px-4">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="glass-card rounded-2xl p-8">
            {/* Back button for forgot/reset modes */}
            {(isForgot || isReset) && (
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to sign in
              </button>
            )}

            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-display text-primary gold-glow mb-2">
                {headerText.title}
              </h1>
              <p className="text-muted-foreground">
                {headerText.subtitle}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username - Sign Up only */}
              {isSignUp && !isForgot && !isReset && (
                <div className="space-y-2">
                  <Label htmlFor="username">{t('auth.username')}</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-10 bg-secondary/50 border-border"
                      placeholder="cosmicwriter"
                    />
                  </div>
                  {errors.username && (
                    <p className="text-destructive text-sm flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.username}
                    </p>
                  )}
                </div>
              )}

              {/* Display Name - Sign Up only */}
              {isSignUp && !isForgot && !isReset && (
                <div className="space-y-2">
                  <Label htmlFor="displayName">{t('auth.display_name')}</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="displayName"
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="pl-10 bg-secondary/50 border-border"
                      placeholder="Cosmic Writer"
                    />
                  </div>
                </div>
              )}

              {/* Email - Not shown for reset mode */}
              {!isReset && (
                <div className="space-y-2">
                  <Label htmlFor="email">{t('auth.email')}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-secondary/50 border-border"
                      placeholder="writer@nibiru93.net"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-destructive text-sm flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.email}
                    </p>
                  )}
                </div>
              )}

              {/* Password - Not shown for forgot mode */}
              {!isForgot && (
                <div className="space-y-2">
                  <Label htmlFor="password">{isReset ? 'New Password' : t('auth.password')}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 bg-secondary/50 border-border"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-destructive text-sm flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.password}
                    </p>
                  )}

                  {/* Password strength indicators - Sign Up and Reset */}
                  {(isSignUp || isReset) && password && (
                    <div className="mt-3 space-y-1">
                      {[
                        { key: 'length', label: 'At least 8 characters' },
                        { key: 'uppercase', label: 'One uppercase letter' },
                        { key: 'lowercase', label: 'One lowercase letter' },
                        { key: 'number', label: 'One number' },
                      ].map(({ key, label }) => (
                        <div
                          key={key}
                          className={`flex items-center gap-2 text-xs ${
                            passwordChecks[key as keyof typeof passwordChecks]
                              ? 'text-green-400'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {passwordChecks[key as keyof typeof passwordChecks] ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <X className="w-3 h-3" />
                          )}
                          {label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Confirm Password - Sign Up and Reset */}
              {(isSignUp || isReset) && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t('auth.confirm_password')}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 bg-secondary/50 border-border"
                      placeholder="••••••••"
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-destructive text-sm flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              )}

              {/* Forgot Password Link - Sign In only */}
              {!isSignUp && !isForgot && !isReset && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot your password?
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                size="lg"
                disabled={loading}
              >
                {loading ? t('common.loading') : 
                  isForgot ? 'Send Reset Link' :
                  isReset ? 'Update Password' :
                  isSignUp ? t('auth.signup') : t('auth.signin')}
              </Button>
            </form>

            {/* Social Login - Only for signin/signup modes */}
            {!isForgot && !isReset && (
              <>
                <div className="relative my-6">
                  <Separator className="bg-border" />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-4 text-sm text-muted-foreground">
                    or continue with
                  </span>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full bg-secondary/50 border-border hover:bg-secondary"
                  size="lg"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                >
                  <GoogleIcon />
                  <span className="ml-2">Google</span>
                </Button>
              </>
            )}

            {/* Toggle Sign In / Sign Up - Not shown for forgot/reset modes */}
            {!isForgot && !isReset && (
              <div className="mt-6 text-center">
                <p className="text-muted-foreground">
                  {isSignUp ? t('auth.have_account') : t('auth.no_account')}{' '}
                  <button
                    type="button"
                    onClick={() => setMode(isSignUp ? 'signin' : 'signup')}
                    className="text-primary hover:underline"
                  >
                    {isSignUp ? t('auth.signin') : t('auth.signup')}
                  </button>
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
}
