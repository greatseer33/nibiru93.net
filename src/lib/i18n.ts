export type Language = 'en' | 'ar' | 'it' | 'fr' | 'es';

export const languages: { code: Language; name: string; nativeName: string; dir: 'ltr' | 'rtl' }[] = [
  { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', dir: 'rtl' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', dir: 'ltr' },
  { code: 'fr', name: 'French', nativeName: 'Français', dir: 'ltr' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', dir: 'ltr' },
];

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.novels': 'Novels',
    'nav.diary': 'My Diary',
    'nav.signin': 'Sign In',
    'nav.signup': 'Sign Up',
    'nav.logout': 'Logout',
    'nav.profile': 'Profile',
    
    // Hero
    'hero.title': 'Nibiru93.net',
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
  ar: {
    // Navigation
    'nav.home': 'الرئيسية',
    'nav.novels': 'الروايات',
    'nav.diary': 'مذكراتي',
    'nav.signin': 'تسجيل الدخول',
    'nav.signup': 'إنشاء حساب',
    'nav.logout': 'تسجيل الخروج',
    'nav.profile': 'الملف الشخصي',
    
    // Hero
    'hero.title': 'Nibiru93.net',
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
  it: {
    // Navigation
    'nav.home': 'Home',
    'nav.novels': 'Romanzi',
    'nav.diary': 'Il Mio Diario',
    'nav.signin': 'Accedi',
    'nav.signup': 'Registrati',
    'nav.logout': 'Esci',
    'nav.profile': 'Profilo',
    
    // Hero
    'hero.title': 'Nibiru93.net',
    'hero.subtitle': 'Dove le Storie Trascendono i Mondi',
    'hero.description': 'Scopri racconti epici, scrivi le tue leggende e tieni il tuo diario privato nelle stelle.',
    'hero.explore': 'Esplora Romanzi',
    'hero.start_writing': 'Inizia a Scrivere',
    
    // Auth
    'auth.signin': 'Accedi',
    'auth.signup': 'Crea Account',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirm_password': 'Conferma Password',
    'auth.username': 'Nome Utente',
    'auth.display_name': 'Nome Visualizzato',
    'auth.forgot_password': 'Password Dimenticata?',
    'auth.no_account': 'Non hai un account?',
    'auth.have_account': 'Hai già un account?',
    'auth.password_requirements': 'La password deve avere almeno 8 caratteri con maiuscola, minuscola e numero',
    'auth.passwords_not_match': 'Le password non corrispondono',
    'auth.welcome_back': 'Bentornato',
    'auth.join_us': 'Unisciti al Cosmo',
    
    // Novels
    'novels.featured': 'Romanzi in Evidenza',
    'novels.trending': 'Di Tendenza',
    'novels.latest': 'Ultimi Aggiornamenti',
    'novels.read_more': 'Leggi di Più',
    'novels.chapters': 'Capitoli',
    'novels.views': 'Visualizzazioni',
    
    // Diary
    'diary.title': 'Il Mio Diario Cosmico',
    'diary.new_entry': 'Nuova Voce',
    'diary.mood': 'Umore',
    'diary.private': 'Privato',
    'diary.save': 'Salva',
    'diary.delete': 'Elimina',
    'diary.edit': 'Modifica',
    'diary.empty': 'Il tuo diario è vuoto. Inizia a scrivere la tua prima voce!',
    
    // Common
    'common.loading': 'Caricamento...',
    'common.error': 'Si è verificato un errore',
    'common.save': 'Salva',
    'common.cancel': 'Annulla',
    'common.delete': 'Elimina',
    'common.edit': 'Modifica',
    'common.search': 'Cerca',
  },
  fr: {
    // Navigation
    'nav.home': 'Accueil',
    'nav.novels': 'Romans',
    'nav.diary': 'Mon Journal',
    'nav.signin': 'Connexion',
    'nav.signup': "S'inscrire",
    'nav.logout': 'Déconnexion',
    'nav.profile': 'Profil',
    
    // Hero
    'hero.title': 'Nibiru93.net',
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
  es: {
    // Navigation
    'nav.home': 'Inicio',
    'nav.novels': 'Novelas',
    'nav.diary': 'Mi Diario',
    'nav.signin': 'Iniciar Sesión',
    'nav.signup': 'Registrarse',
    'nav.logout': 'Cerrar Sesión',
    'nav.profile': 'Perfil',
    
    // Hero
    'hero.title': 'Nibiru93.net',
    'hero.subtitle': 'Donde las Historias Trascienden Mundos',
    'hero.description': 'Descubre relatos épicos, escribe tus propias leyendas y guarda tu diario privado en las estrellas.',
    'hero.explore': 'Explorar Novelas',
    'hero.start_writing': 'Empezar a Escribir',
    
    // Auth
    'auth.signin': 'Iniciar Sesión',
    'auth.signup': 'Crear Cuenta',
    'auth.email': 'Correo Electrónico',
    'auth.password': 'Contraseña',
    'auth.confirm_password': 'Confirmar Contraseña',
    'auth.username': 'Nombre de Usuario',
    'auth.display_name': 'Nombre para Mostrar',
    'auth.forgot_password': '¿Olvidaste tu contraseña?',
    'auth.no_account': '¿No tienes cuenta?',
    'auth.have_account': '¿Ya tienes cuenta?',
    'auth.password_requirements': 'La contraseña debe tener al menos 8 caracteres con mayúscula, minúscula y número',
    'auth.passwords_not_match': 'Las contraseñas no coinciden',
    'auth.welcome_back': 'Bienvenido de Nuevo',
    'auth.join_us': 'Únete al Cosmos',
    
    // Novels
    'novels.featured': 'Novelas Destacadas',
    'novels.trending': 'Tendencias',
    'novels.latest': 'Últimas Actualizaciones',
    'novels.read_more': 'Leer Más',
    'novels.chapters': 'Capítulos',
    'novels.views': 'Vistas',
    
    // Diary
    'diary.title': 'Mi Diario Cósmico',
    'diary.new_entry': 'Nueva Entrada',
    'diary.mood': 'Estado de Ánimo',
    'diary.private': 'Privado',
    'diary.save': 'Guardar',
    'diary.delete': 'Eliminar',
    'diary.edit': 'Editar',
    'diary.empty': 'Tu diario está vacío. ¡Empieza a escribir tu primera entrada!',
    
    // Common
    'common.loading': 'Cargando...',
    'common.error': 'Ocurrió un error',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.delete': 'Eliminar',
    'common.edit': 'Editar',
    'common.search': 'Buscar',
  },
};

export const getDirection = (lang: Language): 'ltr' | 'rtl' => {
  const language = languages.find(l => l.code === lang);
  return language?.dir || 'ltr';
};
