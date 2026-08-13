/**
 * Bouiba Academy — Multilingual i18n Dictionary
 * Languages: Arabic (ar) · Français (fr) · English (en)
 *
 * Usage:
 *   import { useLang } from "@/hooks/use-lang";
 *   const { t } = useLang();
 *   <span>{t("nav.home")}</span>
 */

export type Lang = "ar" | "fr" | "en";

export type I18nKey =
  // Navigation
  | "nav.home"
  | "nav.articles"
  | "nav.courses"
  | "nav.tools"
  | "nav.quiz"
  | "nav.about"
  | "nav.contact"
  | "nav.viewAll"
  | "nav.viewAllArticles"
  | "nav.viewAllCourses"
  | "nav.viewAllTools"
  | "nav.browseAllTools"
  | "nav.menuLabel"
  | "nav.closeMenu"
  | "nav.pageOverview"
  // Auth
  | "auth.login"
  | "auth.logout"
  | "auth.favorites"
  | "auth.startLearning"
  | "auth.startLearningFull"
  // Language
  | "lang.switchTo"
  | "lang.arabic"
  | "lang.french"
  | "lang.english"
  | "lang.ar"
  | "lang.fr"
  | "lang.en"
  // Hero
  | "hero.badge"
  | "hero.title"
  | "hero.title.highlight"
  | "hero.subtitle"
  | "hero.search.placeholder"
  | "hero.search.button"
  | "hero.trending"
  // Sections
  | "section.featured"
  | "section.featuredSub"
  | "section.latestArticles"
  | "section.allCategories"
  | "section.aiTools"
  | "section.aiToolsSub"
  | "section.newsletter"
  | "section.newsletterSub"
  | "section.newsletterCta"
  | "section.newsletterPlaceholder"
  | "section.newsletterSuccess"
  // Cards
  | "card.readMore"
  | "card.minutes"
  | "card.minAbbr"
  | "card.viewCourse"
  | "card.tryTool"
  // Lessons
  | "lessons.title"
  | "lessons.subtitle"
  | "lessons.noLessons"
  | "lessons.category.all"
  // Tools
  | "tools.title"
  | "tools.subtitle"
  | "tools.new"
  | "tools.tryNow"
  // Footer
  | "footer.explore"
  | "footer.academy"
  | "footer.allArticles"
  | "footer.courses"
  | "footer.aiTools"
  | "footer.englishPosts"
  | "footer.frenchContent"
  | "footer.aboutUs"
  | "footer.contactUs"
  | "footer.privacy"
  | "footer.terms"
  | "footer.disclaimer"
  | "footer.copyright"
  | "footer.tagline"
  // General
  | "general.search"
  | "general.close"
  | "general.back"
  | "general.next"
  | "general.loading"
  | "general.error"
  | "general.noItems"
  | "general.new"
  | "general.min"
  | "general.minutes";

type Translations = Record<I18nKey, string>;

const ar: Translations = {
  // Navigation
  "nav.home": "الرئيسية",
  "nav.articles": "المقالات",
  "nav.courses": "دورات",
  "nav.tools": "أدوات AI",
  "nav.quiz": "اختبار AI",
  "nav.about": "عن الأكاديمية",
  "nav.contact": "تواصل",
  "nav.viewAll": "عرض الكل",
  "nav.viewAllArticles": "عرض جميع المقالات",
  "nav.viewAllCourses": "عرض كل الدورات",
  "nav.viewAllTools": "عرض كل الأدوات",
  "nav.browseAllTools": "استعرض كل الأدوات",
  "nav.menuLabel": "القائمة",
  "nav.closeMenu": "إغلاق القائمة",
  "nav.pageOverview": "الصفحة الرئيسية",
  // Auth
  "auth.login": "دخول",
  "auth.logout": "خروج",
  "auth.favorites": "المفضلة",
  "auth.startLearning": "ابدأ التعلم",
  "auth.startLearningFull": "ابدأ التعلم (مسار ذكي)",
  // Language
  "lang.switchTo": "تغيير اللغة",
  "lang.arabic": "العربية",
  "lang.french": "الفرنسية",
  "lang.english": "الإنجليزية",
  "lang.ar": "عربي",
  "lang.fr": "Français",
  "lang.en": "English",
  // Hero
  "hero.badge": "منصة تقنية عربية مستقلة • شروحات عملية وأدوات موثوقة",
  "hero.title": "المرجع المعرفي العربي",
  "hero.title.highlight": "للذكاء الاصطناعي",
  "hero.subtitle":
    "نقدم للمطورين وصناع المحتوى والمهتمين بالتقنية شروحات عملية خطوة بخطوة، مراجعات محايدة للنماذج، وأدوات ذكاء اصطناعي تفاعلية دون تعقيد أو حشو.",
  "hero.search.placeholder": "ابحث عن مقال، أداة AI، أو موضوع تقني...",
  "hero.search.button": "بحث",
  "hero.trending": "المواضيع الشائعة:",
  // Sections
  "section.featured": "تغطية خاصة وموصى بها",
  "section.featuredSub": "اختيار التحرير",
  "section.latestArticles": "أحدث المقالات",
  "section.allCategories": "الكل",
  "section.aiTools": "أدوات الذكاء الاصطناعي المجانية",
  "section.aiToolsSub": "جرّبها مباشرة — بدون تسجيل",
  "section.newsletter": "انضم إلى النشرة المعرفية",
  "section.newsletterSub":
    "أحدث التطورات في الذكاء الاصطناعي، مقالات حصرية، وأدوات جديدة مباشرة في بريدك.",
  "section.newsletterCta": "اشترك مجاناً",
  "section.newsletterPlaceholder": "بريدك الإلكتروني...",
  "section.newsletterSuccess": "شكراً لانضمامك! تم تسجيل بريدك الإلكتروني.",
  // Cards
  "card.readMore": "اقرأ المزيد",
  "card.minutes": "دقائق",
  "card.minAbbr": "دق",
  "card.viewCourse": "عرض الدورة",
  "card.tryTool": "جرّب الأداة",
  // Lessons
  "lessons.title": "دورات الذكاء الاصطناعي",
  "lessons.subtitle": "تعلّم بالعربية مع أفضل دروس الفيديو المنظمة",
  "lessons.noLessons": "لا توجد دروس حالياً",
  "lessons.category.all": "جميع الفئات",
  // Tools
  "tools.title": "أدوات الذكاء الاصطناعي المجانية",
  "tools.subtitle": "مجموعة أدوات عربية تفاعلية مجانية",
  "tools.new": "جديد",
  "tools.tryNow": "جرّب الآن",
  // Footer
  "footer.explore": "استكشف",
  "footer.academy": "الأكاديمية",
  "footer.allArticles": "جميع المقالات",
  "footer.courses": "الدروس",
  "footer.aiTools": "أدوات AI",
  "footer.englishPosts": "المقالات الإنجليزية 🇬🇧",
  "footer.frenchContent": "المحتوى الفرنسي 🇫🇷",
  "footer.aboutUs": "من نحن",
  "footer.contactUs": "تواصل معنا",
  "footer.privacy": "سياسة الخصوصية",
  "footer.terms": "شروط الاستخدام",
  "footer.disclaimer": "إخلاء المسؤولية",
  "footer.copyright": "جميع الحقوق محفوظة.",
  "footer.tagline":
    "أكاديميتك العربية للذكاء الاصطناعي — دروس عملية، أحدث الأخبار، وأدوات مجانية لمواكبة عصر الذكاء الاصطناعي.",
  // General
  "general.search": "بحث",
  "general.close": "إغلاق",
  "general.back": "رجوع",
  "general.next": "التالي",
  "general.loading": "جارٍ التحميل...",
  "general.error": "حدث خطأ",
  "general.noItems": "لا توجد عناصر حالياً",
  "general.new": "جديد",
  "general.min": "دق",
  "general.minutes": "دقائق",
};

const en: Translations = {
  // Navigation
  "nav.home": "Home",
  "nav.articles": "Articles",
  "nav.courses": "Courses",
  "nav.tools": "AI Tools",
  "nav.quiz": "AI Quiz",
  "nav.about": "About",
  "nav.contact": "Contact",
  "nav.viewAll": "View All",
  "nav.viewAllArticles": "View all articles",
  "nav.viewAllCourses": "View all courses",
  "nav.viewAllTools": "View all tools",
  "nav.browseAllTools": "Browse all tools",
  "nav.menuLabel": "Menu",
  "nav.closeMenu": "Close menu",
  "nav.pageOverview": "Overview",
  // Auth
  "auth.login": "Login",
  "auth.logout": "Logout",
  "auth.favorites": "Favorites",
  "auth.startLearning": "Start Learning",
  "auth.startLearningFull": "Start Learning (Smart Path)",
  // Language
  "lang.switchTo": "Change Language",
  "lang.arabic": "Arabic",
  "lang.french": "French",
  "lang.english": "English",
  "lang.ar": "عربي",
  "lang.fr": "Français",
  "lang.en": "English",
  // Hero
  "hero.badge": "Independent Arabic AI Platform • Practical Guides & Trusted Tools",
  "hero.title": "The Arabic Reference for",
  "hero.title.highlight": "Artificial Intelligence",
  "hero.subtitle":
    "We provide developers, content creators, and tech enthusiasts with practical step-by-step guides, unbiased model reviews, and free interactive AI tools — without fluff.",
  "hero.search.placeholder": "Search articles, AI tools, or tech topics...",
  "hero.search.button": "Search",
  "hero.trending": "Trending:",
  // Sections
  "section.featured": "Featured & Recommended",
  "section.featuredSub": "Editor's Pick",
  "section.latestArticles": "Latest Articles",
  "section.allCategories": "All",
  "section.aiTools": "Free AI Tools",
  "section.aiToolsSub": "Try them now — no registration needed",
  "section.newsletter": "Join the Knowledge Newsletter",
  "section.newsletterSub":
    "Latest AI developments, exclusive articles, and new tools delivered to your inbox.",
  "section.newsletterCta": "Subscribe for Free",
  "section.newsletterPlaceholder": "Your email address...",
  "section.newsletterSuccess": "Thank you for joining! Your email has been registered.",
  // Cards
  "card.readMore": "Read More",
  "card.minutes": "minutes",
  "card.minAbbr": "min",
  "card.viewCourse": "View Course",
  "card.tryTool": "Try Tool",
  // Lessons
  "lessons.title": "AI Courses",
  "lessons.subtitle": "Learn with the best structured video lessons",
  "lessons.noLessons": "No lessons available yet",
  "lessons.category.all": "All Categories",
  // Tools
  "tools.title": "Free AI Tools",
  "tools.subtitle": "A collection of free interactive AI tools",
  "tools.new": "New",
  "tools.tryNow": "Try Now",
  // Footer
  "footer.explore": "Explore",
  "footer.academy": "Academy",
  "footer.allArticles": "All Articles",
  "footer.courses": "Courses",
  "footer.aiTools": "AI Tools",
  "footer.englishPosts": "English Posts",
  "footer.frenchContent": "French Content",
  "footer.aboutUs": "About Us",
  "footer.contactUs": "Contact Us",
  "footer.privacy": "Privacy Policy",
  "footer.terms": "Terms of Use",
  "footer.disclaimer": "Disclaimer",
  "footer.copyright": "All rights reserved.",
  "footer.tagline":
    "Your premier AI Academy — practical tutorials, latest news, and free tools to thrive in the artificial intelligence era.",
  // General
  "general.search": "Search",
  "general.close": "Close",
  "general.back": "Back",
  "general.next": "Next",
  "general.loading": "Loading...",
  "general.error": "An error occurred",
  "general.noItems": "No items available",
  "general.new": "New",
  "general.min": "min",
  "general.minutes": "minutes",
};

const fr: Translations = {
  // Navigation
  "nav.home": "Accueil",
  "nav.articles": "Articles",
  "nav.courses": "Cours",
  "nav.tools": "Outils IA",
  "nav.quiz": "Quiz IA",
  "nav.about": "À propos",
  "nav.contact": "Contact",
  "nav.viewAll": "Voir tout",
  "nav.viewAllArticles": "Voir tous les articles",
  "nav.viewAllCourses": "Voir tous les cours",
  "nav.viewAllTools": "Voir tous les outils",
  "nav.browseAllTools": "Parcourir les outils",
  "nav.menuLabel": "Menu",
  "nav.closeMenu": "Fermer le menu",
  "nav.pageOverview": "Aperçu",
  // Auth
  "auth.login": "Connexion",
  "auth.logout": "Déconnexion",
  "auth.favorites": "Favoris",
  "auth.startLearning": "Commencer",
  "auth.startLearningFull": "Commencer (Parcours intelligent)",
  // Language
  "lang.switchTo": "Changer de langue",
  "lang.arabic": "Arabe",
  "lang.french": "Français",
  "lang.english": "Anglais",
  "lang.ar": "عربي",
  "lang.fr": "Français",
  "lang.en": "English",
  // Hero
  "hero.badge": "Plateforme arabe indépendante • Guides pratiques & Outils fiables",
  "hero.title": "La référence arabophone pour",
  "hero.title.highlight": "l'Intelligence Artificielle",
  "hero.subtitle":
    "Nous offrons aux développeurs, créateurs de contenu et passionnés de tech des guides pratiques étape par étape, des analyses objectives et des outils IA gratuits.",
  "hero.search.placeholder": "Rechercher des articles, outils IA ou sujets tech...",
  "hero.search.button": "Rechercher",
  "hero.trending": "Tendances :",
  // Sections
  "section.featured": "À la une & Recommandé",
  "section.featuredSub": "Choix de la rédaction",
  "section.latestArticles": "Derniers articles",
  "section.allCategories": "Tout",
  "section.aiTools": "Outils IA gratuits",
  "section.aiToolsSub": "Essayez maintenant — sans inscription",
  "section.newsletter": "Rejoignez la newsletter",
  "section.newsletterSub":
    "Les dernières actualités IA, articles exclusifs et nouveaux outils directement dans votre boîte mail.",
  "section.newsletterCta": "S'abonner gratuitement",
  "section.newsletterPlaceholder": "Votre adresse e-mail...",
  "section.newsletterSuccess": "Merci ! Votre adresse e-mail a bien été enregistrée.",
  // Cards
  "card.readMore": "Lire la suite",
  "card.minutes": "minutes",
  "card.minAbbr": "min",
  "card.viewCourse": "Voir le cours",
  "card.tryTool": "Essayer l'outil",
  // Lessons
  "lessons.title": "Cours sur l'IA",
  "lessons.subtitle": "Apprenez avec les meilleures leçons vidéo structurées",
  "lessons.noLessons": "Aucune leçon disponible pour le moment",
  "lessons.category.all": "Toutes les catégories",
  // Tools
  "tools.title": "Outils IA gratuits",
  "tools.subtitle": "Une collection d'outils IA interactifs gratuits",
  "tools.new": "Nouveau",
  "tools.tryNow": "Essayer",
  // Footer
  "footer.explore": "Explorer",
  "footer.academy": "Académie",
  "footer.allArticles": "Tous les articles",
  "footer.courses": "Cours",
  "footer.aiTools": "Outils IA",
  "footer.englishPosts": "Articles anglais 🇬🇧",
  "footer.frenchContent": "Contenu français 🇫🇷",
  "footer.aboutUs": "À propos",
  "footer.contactUs": "Nous contacter",
  "footer.privacy": "Politique de confidentialité",
  "footer.terms": "Conditions d'utilisation",
  "footer.disclaimer": "Avertissement",
  "footer.copyright": "Tous droits réservés.",
  "footer.tagline":
    "Votre académie IA de référence — tutoriels pratiques, dernières actualités et outils gratuits pour progresser à l'ère de l'IA.",
  // General
  "general.search": "Rechercher",
  "general.close": "Fermer",
  "general.back": "Retour",
  "general.next": "Suivant",
  "general.loading": "Chargement...",
  "general.error": "Une erreur est survenue",
  "general.noItems": "Aucun élément disponible",
  "general.new": "Nouveau",
  "general.min": "min",
  "general.minutes": "minutes",
};

export const translations: Record<Lang, Translations> = { ar, en, fr };

/** Translate a key for the given language. Falls back to Arabic if key is missing. */
export function translate(lang: Lang, key: I18nKey): string {
  return translations[lang]?.[key] ?? translations.ar[key] ?? key;
}
