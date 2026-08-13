import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Menu,
  X,
  Star,
  LogIn,
  ChevronDown,
  Home,
  FileText,
  GraduationCap,
  Cpu,
  HelpCircle,
  Info,
  PhoneCall,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getLabels } from "@/lib/blogger.functions";
import { listLessons } from "@/lib/lessons.functions";
import { NavDropdown, type NavDropdownItem } from "@/components/nav-dropdown";
import { LangSwitcher } from "@/components/lang-switcher";
import { useLang } from "@/hooks/use-lang";
import bouibaLogo from "@/assets/bouiba-logo-v3.png.asset.json";

const TOOL_ITEMS_AR: NavDropdownItem[] = [
  {
    label: "مسارات التعلم (Roadmap)",
    to: "/tools/roadmap",
    description: "خريطة طريق تفاعلية للدراسة",
    badge: "جديد",
  },
  {
    label: "مولّد السيرة الذاتية",
    to: "/tools/cv",
    description: "CV احترافي في ثوانٍ",
    badge: "جديد",
  },
  {
    label: "العميل الذكي (Agent)",
    to: "/tools/agent",
    description: "بناء وأتمتة المهام بالوكلاء",
    badge: "جديد",
  },
  {
    label: "الإيميل المؤقت",
    to: "/tools/tempmail",
    description: "بريد مجهول للتسجيل في المواقع",
    badge: "جديد",
  },
  {
    label: "صانع سيناريو الريلز",
    to: "/tools/reels",
    description: "سيناريو ريلز وتيك توك فيروسي",
    badge: "جديد",
  },
  { label: "المساعد الدراسي", to: "/tools/study", description: "شرح وبطاقات مراجعة واختبار" },
  { label: "إعادة الصياغة والتدقيق", to: "/tools/rewrite", description: "تحرير وتصحيح لغوي" },
  { label: "منشورات السوشيال ميديا", to: "/tools/social", description: "منشورات وهاشتاغات جاهزة" },
  { label: "كاتب الرسائل", to: "/tools/email", description: "إيميلات احترافية جاهزة" },
  { label: "نص إلى صورة", to: "/tools/image", description: "توليد صور بالذكاء الاصطناعي" },
  { label: "تلخيص المقالات", to: "/tools/summarize", description: "ملخصات ذكية سريعة" },
  { label: "الترجمة الذكية", to: "/tools/translate", description: "ترجمة دقيقة بين اللغات" },
  { label: "توليد الأفكار", to: "/tools/ideas", description: "أفكار محتوى ومشاريع" },
  { label: "مساعد SEO", to: "/tools/seo", description: "تحسين ترتيب موقعك" },
];

const TOOL_ITEMS_EN: NavDropdownItem[] = [
  {
    label: "Learning Roadmaps",
    to: "/tools/roadmap",
    description: "Interactive study roadmaps",
    badge: "New",
  },
  {
    label: "Resume Builder",
    to: "/tools/cv",
    description: "Professional CV in seconds",
    badge: "New",
  },
  {
    label: "AI Agent Builder",
    to: "/tools/agent",
    description: "Build custom task agents",
    badge: "New",
  },
  {
    label: "Temp Mail",
    to: "/tools/tempmail",
    description: "Disposable inbox in one click",
    badge: "New",
  },
  {
    label: "AI Reels Creator",
    to: "/tools/reels",
    description: "Viral Reels & Shorts script generator",
    badge: "New",
  },
  { label: "Study Assistant", to: "/tools/study", description: "Explanations, flashcards & quiz" },
  { label: "Rewrite & Proofread", to: "/tools/rewrite", description: "Cleaner, correct text" },
  { label: "Social Media Posts", to: "/tools/social", description: "Posts, reels & hashtags" },
  { label: "Email Writer", to: "/tools/email", description: "Ready-to-send professional emails" },
  { label: "Text to Image", to: "/tools/image", description: "Generate AI images from prompts" },
  { label: "Article Summarizer", to: "/tools/summarize", description: "Fast AI summaries" },
  { label: "Smart Translator", to: "/tools/translate", description: "Accurate multi-language translation" },
  { label: "Idea Generator", to: "/tools/ideas", description: "Content & project ideas" },
  { label: "SEO Assistant", to: "/tools/seo", description: "Optimize search ranking" },
];

const TOOL_ITEMS_FR: NavDropdownItem[] = [
  {
    label: "Feuilles de route",
    to: "/tools/roadmap",
    description: "Parcours d'apprentissage interactifs",
    badge: "Nouveau",
  },
  {
    label: "Créateur de CV",
    to: "/tools/cv",
    description: "CV professionnel en secondes",
    badge: "Nouveau",
  },
  {
    label: "Agent IA",
    to: "/tools/agent",
    description: "Créer des agents de tâches personnalisés",
    badge: "Nouveau",
  },
  {
    label: "Mail temporaire",
    to: "/tools/tempmail",
    description: "Boîte de réception jetable en un clic",
    badge: "Nouveau",
  },
  {
    label: "Créateur de Reels IA",
    to: "/tools/reels",
    description: "Générateur de scripts viraux",
    badge: "Nouveau",
  },
  { label: "Assistant études", to: "/tools/study", description: "Explications, fiches & quiz" },
  { label: "Réécriture & Correction", to: "/tools/rewrite", description: "Texte corrigé et amélioré" },
  { label: "Posts réseaux sociaux", to: "/tools/social", description: "Publications & hashtags" },
  { label: "Rédacteur d'e-mails", to: "/tools/email", description: "E-mails professionnels prêts à envoyer" },
  { label: "Texte en image", to: "/tools/image", description: "Générer des images avec l'IA" },
  { label: "Résumeur d'articles", to: "/tools/summarize", description: "Résumés IA rapides" },
  { label: "Traducteur intelligent", to: "/tools/translate", description: "Traduction multilingue précise" },
  { label: "Générateur d'idées", to: "/tools/ideas", description: "Idées de contenu & projets" },
  { label: "Assistant SEO", to: "/tools/seo", description: "Optimiser votre classement" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [mPosts, setMPosts] = useState(false);
  const [mLessons, setMLessons] = useState(false);
  const [mTools, setMTools] = useState(false);
  const { lang, t, isRTL } = useLang();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setAuthed(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setAuthed(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);

  // Block body scroll when mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const labelsQ = useQuery({
    queryKey: ["labels"],
    queryFn: () => getLabels(),
    staleTime: 10 * 60_000,
    enabled: false,
  });
  const lessonsQ = useQuery({
    queryKey: ["lessons", "public"],
    queryFn: () => listLessons(),
    staleTime: 10 * 60_000,
    enabled: false,
  });

  const postItems: NavDropdownItem[] = (labelsQ.data ?? [])
    .slice(0, 10)
    .map((l: { label: string; count: number }) => ({
      label: `${l.label} (${l.count})`,
      to: "/posts",
      search: { label: l.label },
    }));

  const lessonCategories = Array.from(
    new Set(
      (lessonsQ.data ?? [])
        .map((l: { category?: string | null }) => l.category)
        .filter(Boolean) as string[],
    ),
  );
  const lessonItems: NavDropdownItem[] = lessonCategories.map((c) => ({
    label: c,
    to: "/lessons",
  }));

  // Pick tool items based on current language
  const toolItems =
    lang === "fr" ? TOOL_ITEMS_FR : lang === "en" ? TOOL_ITEMS_EN : TOOL_ITEMS_AR;

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/60">
        {/* Glassmorphism background */}
        <div className="absolute inset-0 -z-10 bg-background/80 backdrop-blur-md" />

        <div className="container-page flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 shrink-0 min-w-0"
            aria-label="Bouiba Academy"
          >
            <picture>
              <source srcSet="/bouiba-logo-96.webp" type="image/webp" />
              <img
                src="/favicon-64.png"
                alt="Bouiba Academy"
                className="h-8 w-8 sm:h-9 sm:w-9 object-contain drop-shadow-sm"
                width={36}
                height={36}
                fetchPriority="high"
                decoding="sync"
              />
            </picture>
            <span className="gradient-text font-display text-lg sm:text-xl font-extrabold tracking-tight select-none">
              Bouiba Academy
            </span>
          </Link>

          {/* ── Desktop nav ──────────────────────────────────────────── */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            <Link
              to="/"
              className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-accent/60"
              activeOptions={{ exact: true }}
              activeProps={{ className: "text-foreground bg-accent/60" }}
            >
              {t("nav.home")}
            </Link>

            <NavDropdown
              label={t("nav.articles")}
              to="/posts"
              items={postItems}
              footer={{
                label: t("nav.viewAllArticles"),
                to: "/posts",
              }}
              onLoad={() => {
                if (!labelsQ.data && !labelsQ.isFetching) labelsQ.refetch();
              }}
            />

            <NavDropdown
              label={t("nav.courses")}
              to="/lessons"
              items={lessonItems}
              footer={{
                label: t("nav.viewAllCourses"),
                to: "/lessons",
              }}
              onLoad={() => {
                if (!lessonsQ.data && !lessonsQ.isFetching) lessonsQ.refetch();
              }}
            />

            <NavDropdown
              label={t("nav.tools")}
              to="/tools"
              items={toolItems}
              footer={{
                label: t("nav.browseAllTools"),
                to: "/tools",
              }}
              badge={true}
            />

            <Link
              to="/quiz"
              className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-accent/60"
              activeProps={{ className: "text-foreground bg-accent/60" }}
            >
              {t("nav.quiz")}
            </Link>

            <Link
              to="/about"
              className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-accent/60"
              activeProps={{ className: "text-foreground bg-accent/60" }}
            >
              {t("nav.about")}
            </Link>

            <Link
              to="/contact"
              className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-accent/60"
              activeProps={{ className: "text-foreground bg-accent/60" }}
            >
              {t("nav.contact")}
            </Link>
          </nav>

          {/* ── Desktop actions ──────────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-2">
            {/* 3-language switcher */}
            <LangSwitcher variant="compact" />

            {authed ? (
              <Link
                to="/favorites"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-semibold hover:bg-accent transition-colors"
              >
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                {t("auth.favorites")}
              </Link>
            ) : (
              <Link
                id="btn-login"
                to="/auth"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-semibold hover:bg-accent transition-colors"
              >
                <LogIn className="h-4 w-4" />
                {t("auth.login")}
              </Link>
            )}

            <Link
              to="/tools/roadmap"
              className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition-all hover:opacity-90 hover:shadow-elegant"
            >
              {t("auth.startLearning")}
            </Link>
          </div>

          {/* ── Mobile: hamburger only ──────────────────────────────── */}
          <div className="flex md:hidden items-center gap-2">
            {/* Compact lang switcher on mobile too */}
            <LangSwitcher variant="compact" className="scale-90" />

            <button
              onClick={() => {
                const next = !open;
                setOpen(next);
                if (next) {
                  if (!labelsQ.data && !labelsQ.isFetching) labelsQ.refetch();
                  if (!lessonsQ.data && !lessonsQ.isFetching) lessonsQ.refetch();
                }
              }}
              className="inline-flex items-center justify-center rounded-lg p-2.5 text-foreground hover:bg-accent transition-colors"
              aria-label={t("nav.menuLabel")}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Drawer ─────────────────────────────────────────────── */}
      {open && (
        <div className="fixed inset-0 z-[100] md:hidden flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-background/60 backdrop-blur-md"
            onClick={() => setOpen(false)}
          />

          {/* Drawer panel */}
          <div
            className={`relative z-10 w-[85vw] max-w-sm h-full bg-background shadow-2xl flex flex-col justify-between overflow-y-auto
              ${isRTL ? "border-l border-border/50" : "border-r border-border/50"}
            `}
          >
            {/* Inner padding wrapper */}
            <div className="p-6 space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-border/60">
                <Link
                  to="/"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 min-w-0"
                >
                  <img
                    src={bouibaLogo.url}
                    alt="Bouiba Academy"
                    className="h-8 w-8 object-contain"
                    width={32}
                    height={32}
                  />
                  <span className="gradient-text font-display text-lg font-extrabold tracking-tight select-none">
                    Bouiba Academy
                  </span>
                </Link>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-2 hover:bg-accent text-foreground transition-colors"
                  aria-label={t("nav.closeMenu")}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="flex flex-col gap-2" aria-label="Mobile navigation">
                <Link
                  to="/"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-all group"
                  activeOptions={{ exact: true }}
                  activeProps={{
                    className: `text-foreground bg-accent/40 ${isRTL ? "border-r-2" : "border-l-2"} border-primary`,
                  }}
                >
                  <Home className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span>{t("nav.home")}</span>
                </Link>

                <MobileGroup
                  label={t("nav.articles")}
                  open={mPosts}
                  onToggle={() => setMPosts((v) => !v)}
                  overviewTo="/posts"
                  overviewLabel={t("nav.viewAllArticles")}
                  onNavigate={() => setOpen(false)}
                  items={postItems}
                  icon={FileText}
                />

                <MobileGroup
                  label={t("nav.courses")}
                  open={mLessons}
                  onToggle={() => setMLessons((v) => !v)}
                  overviewTo="/lessons"
                  overviewLabel={t("nav.viewAllCourses")}
                  onNavigate={() => setOpen(false)}
                  items={lessonItems}
                  icon={GraduationCap}
                />

                <MobileGroup
                  label={t("nav.tools")}
                  open={mTools}
                  onToggle={() => setMTools((v) => !v)}
                  overviewTo="/tools"
                  overviewLabel={t("nav.browseAllTools")}
                  onNavigate={() => setOpen(false)}
                  items={toolItems}
                  icon={Cpu}
                  badge={true}
                />

                <Link
                  to="/quiz"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-all group"
                  activeProps={{
                    className: `text-foreground bg-accent/40 ${isRTL ? "border-r-2" : "border-l-2"} border-primary`,
                  }}
                >
                  <HelpCircle className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span>{t("nav.quiz")}</span>
                </Link>

                <Link
                  to="/about"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-all group"
                  activeProps={{
                    className: `text-foreground bg-accent/40 ${isRTL ? "border-r-2" : "border-l-2"} border-primary`,
                  }}
                >
                  <Info className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span>{t("nav.about")}</span>
                </Link>

                <Link
                  to="/contact"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-all group"
                  activeProps={{
                    className: `text-foreground bg-accent/40 ${isRTL ? "border-r-2" : "border-l-2"} border-primary`,
                  }}
                >
                  <PhoneCall className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span>{t("nav.contact")}</span>
                </Link>
              </nav>
            </div>

            {/* Drawer Footer */}
            <div className="p-6 pt-0 border-t border-border/60 space-y-3">
              {authed ? (
                <Link
                  to="/favorites"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-border bg-accent/30 font-semibold text-amber-600 hover:bg-accent transition-colors"
                >
                  <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                  {t("auth.favorites")}
                </Link>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-border bg-accent/30 font-semibold text-foreground hover:bg-accent transition-colors"
                >
                  <LogIn className="h-4 w-4" />
                  {t("auth.login")}
                </Link>
              )}

              <Link
                to="/tools/roadmap"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-gradient-to-r from-primary to-primary-glow text-white font-bold shadow-lg shadow-primary/25 hover:opacity-95 text-center transition-all duration-300"
              >
                <Sparkles className="h-4 w-4 text-amber-300 animate-pulse" />
                {t("auth.startLearningFull")}
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function MobileGroup({
  label,
  open,
  onToggle,
  overviewTo,
  overviewLabel,
  items,
  onNavigate,
  icon: Icon,
  badge,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  overviewTo: string;
  overviewLabel: string;
  items: NavDropdownItem[];
  onNavigate: () => void;
  icon: React.ComponentType<{ className?: string }>;
  badge?: boolean;
}) {
  const { t } = useLang();
  return (
    <div className="rounded-xl overflow-hidden bg-accent/10 border border-border/30 transition-all">
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
          open
            ? "bg-accent/40 text-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-accent/30"
        }`}
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          <Icon
            className={`h-5 w-5 ${open ? "text-primary animate-pulse" : "text-muted-foreground"}`}
          />
          <span>{label}</span>
          {badge && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
          )}
        </div>
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-300 ${open ? "rotate-180 text-primary" : "text-muted-foreground"}`}
        />
      </button>
      {open && (
        <div className="px-4 pb-3 pt-1 space-y-1 bg-accent/5 border-t border-border/20">
          <Link
            to={overviewTo}
            onClick={onNavigate}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-primary hover:bg-accent/50 transition-colors"
          >
            {overviewLabel}
          </Link>
          <div className="grid gap-1 mt-1">
            {items.length === 0 ? (
              <p className="px-3 py-2 text-xs text-muted-foreground">{t("general.noItems")}</p>
            ) : (
              items.map((it, i) => (
                <Link
                  key={i}
                  to={it.to}
                  search={it.search as never}
                  onClick={onNavigate}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-foreground/90">{it.label}</span>
                    {it.description && (
                      <span className="text-[10px] text-muted-foreground/80 leading-normal">
                        {it.description}
                      </span>
                    )}
                  </div>
                  {it.badge && (
                    <span className="bg-primary/20 text-primary text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                      {it.badge}
                    </span>
                  )}
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
