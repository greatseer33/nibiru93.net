export type Language = 'en' | 'fr' | 'ar';

export const languages: { code: Language; name: string; nativeName: string; dir: 'ltr' | 'rtl' }[] = [
  { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr' },
  { code: 'fr', name: 'French', nativeName: 'Français', dir: 'ltr' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', dir: 'rtl' },
];

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.novels': 'Novels',
    'nav.diary': 'My Diary',
    'nav.poetry': 'Poetry',
    'nav.signin': 'Sign In',
    'nav.signup': 'Sign Up',
    'nav.logout': 'Logout',
    'nav.profile': 'Profile',
    
    // Hero
    'hero.title': 'Nibiru media.net',
    'hero.subtitle': 'Where Stories Transcend Worlds',
    'hero.description': 'Discover epic tales, write your own legends, and keep your private diary in the stars.',
    'hero.explore': 'Explore Novels',
    'hero.start_writing': 'Start Writing',
    
    // Auth
    'auth.signin': 'Sign In',
    'auth.signup': 'Create Account',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirm_password': 'Confirm Password',
    'auth.username': 'Username',
    'auth.display_name': 'Display Name',
    'auth.forgot_password': 'Forgot Password?',
    'auth.no_account': "Don't have an account?",
    'auth.have_account': 'Already have an account?',
    'auth.password_requirements': 'Password must be at least 8 characters with uppercase, lowercase, and number',
    'auth.passwords_not_match': 'Passwords do not match',
    'auth.welcome_back': 'Welcome Back',
    'auth.join_us': 'Join the Cosmos',
    
    // Novels
    'novels.featured': 'Featured Novels',
    'novels.trending': 'Trending Now',
    'novels.latest': 'Latest Updates',
    'novels.read_more': 'Read More',
    'novels.chapters': 'Chapters',
    'novels.views': 'Views',
    
    // Diary
    'diary.title': 'My Cosmic Diary',
    'diary.new_entry': 'New Entry',
    'diary.mood': 'Mood',
    'diary.private': 'Private',
    'diary.save': 'Save Entry',
    'diary.delete': 'Delete',
    'diary.edit': 'Edit',
    'diary.empty': 'Your diary is empty. Start writing your first entry!',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.search': 'Search',
  },
  fr: {
    // Navigation
    'nav.home': 'Accueil',
    'nav.novels': 'Romans',
    'nav.diary': 'Mon Journal',
    'nav.poetry': 'Poésie',
    'nav.signin': 'Connexion',
    'nav.signup': "S'inscrire",
    'nav.logout': 'Déconnexion',
    'nav.profile': 'Profil',
    
    // Hero
    'hero.title': 'Nibiru media.net',
    'hero.subtitle': 'Où les Histoires Transcendent les Mondes',
    'hero.description': 'Découvrez des récits épiques, écrivez vos propres légendes et gardez votre journal intime dans les étoiles.',
    'hero.explore': 'Explorer les Romans',
    'hero.start_writing': 'Commencer à Écrire',
    
    // Auth
    'auth.signin': 'Connexion',
    'auth.signup': 'Créer un Compte',
    'auth.email': 'Email',
    'auth.password': 'Mot de passe',
    'auth.confirm_password': 'Confirmer le mot de passe',
    'auth.username': "Nom d'utilisateur",
    'auth.display_name': "Nom d'affichage",
    'auth.forgot_password': 'Mot de passe oublié?',
    'auth.no_account': "Pas de compte?",
    'auth.have_account': 'Déjà un compte?',
    'auth.password_requirements': 'Le mot de passe doit contenir au moins 8 caractères avec majuscule, minuscule et chiffre',
    'auth.passwords_not_match': 'Les mots de passe ne correspondent pas',
    'auth.welcome_back': 'Bon Retour',
    'auth.join_us': 'Rejoignez le Cosmos',
    
    // Novels
    'novels.featured': 'Romans en Vedette',
    'novels.trending': 'Tendances',
    'novels.latest': 'Dernières Mises à Jour',
    'novels.read_more': 'Lire Plus',
    'novels.chapters': 'Chapitres',
    'novels.views': 'Vues',
    
    // Diary
    'diary.title': 'Mon Journal Cosmique',
    'diary.new_entry': 'Nouvelle Entrée',
    'diary.mood': 'Humeur',
    'diary.private': 'Privé',
    'diary.save': 'Enregistrer',
    'diary.delete': 'Supprimer',
    'diary.edit': 'Modifier',
    'diary.empty': 'Votre journal est vide. Commencez à écrire votre première entrée!',
    
    // Common
    'common.loading': 'Chargement...',
    'common.error': 'Une erreur est survenue',
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.search': 'Rechercher',
  },
  ar: {
    // Navigation
    'nav.home': 'الرئيسية',
    'nav.novels': 'الروايات',
    'nav.diary': 'مذكراتي',
    'nav.poetry': 'الشعر',
    'nav.signin': 'تسجيل الدخول',
    'nav.signup': 'إنشاء حساب',
    'nav.logout': 'تسجيل الخروج',
    'nav.profile': 'الملف الشخصي',
    
    // Hero
    'hero.title': 'Nibiru media.net',
    'hero.subtitle': 'حيث تتجاوز القصص العوالم',
    'hero.description': 'اكتشف الملاحم العظيمة، اكتب أساطيرك الخاصة، واحفظ مذكراتك في النجوم.',
    'hero.explore': 'استكشف الروايات',
    'hero.start_writing': 'ابدأ الكتابة',
    
    // Auth
    'auth.signin': 'تسجيل الدخول',
    'auth.signup': 'إنشاء حساب',
    'auth.email': 'البريد الإلكتروني',
    'auth.password': 'كلمة المرور',
    'auth.confirm_password': 'تأكيد كلمة المرور',
    'auth.username': 'اسم المستخدم',
    'auth.display_name': 'اسم العرض',
    'auth.forgot_password': 'نسيت كلمة المرور؟',
    'auth.no_account': 'ليس لديك حساب؟',
    'auth.have_account': 'لديك حساب بالفعل؟',
    'auth.password_requirements': 'يجب أن تكون كلمة المرور 8 أحرف على الأقل مع حرف كبير وحرف صغير ورقم',
    'auth.passwords_not_match': 'كلمات المرور غير متطابقة',
    'auth.welcome_back': 'مرحباً بعودتك',
    'auth.join_us': 'انضم إلى الكون',
    
    // Novels
    'novels.featured': 'روايات مميزة',
    'novels.trending': 'الأكثر رواجاً',
    'novels.latest': 'آخر التحديثات',
    'novels.read_more': 'اقرأ المزيد',
    'novels.chapters': 'الفصول',
    'novels.views': 'المشاهدات',
    
    // Diary
    'diary.title': 'مذكراتي الكونية',
    'diary.new_entry': 'إدخال جديد',
    'diary.mood': 'المزاج',
    'diary.private': 'خاص',
    'diary.save': 'حفظ',
    'diary.delete': 'حذف',
    'diary.edit': 'تعديل',
    'diary.empty': 'مذكراتك فارغة. ابدأ بكتابة أول إدخال!',
    
    // Common
    'common.loading': 'جاري التحميل...',
    'common.error': 'حدث خطأ',
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.delete': 'حذف',
    'common.edit': 'تعديل',
    'common.search': 'بحث',
  },
};

export const getDirection = (lang: Language): 'ltr' | 'rtl' => {
  const language = languages.find(l => l.code === lang);
  return language?.dir || 'ltr';
};
