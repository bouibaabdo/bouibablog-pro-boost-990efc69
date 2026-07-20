import { Link, useNavigate } from "@tanstack/react-router";
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
  Trophy,
  Info,
  PhoneCall,
  Sparkles,
  Globe,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getLabels } from "@/lib/blogger.functions";
import { listLessons } from "@/lib/lessons.functions";
import { NavDropdown, type NavDropdownItem } from "@/components/nav-dropdown";
import bouibaLogo from "@/assets/bouiba-logo-v3.png.asset.json";

const TOOL_ITEMS_AR: NavDropdownItem[] = [
  {
    label: "مسارات التعلم (Roadmap)",
    to: "/tools/roadmap",
    description: "خريطة طريق تفاعلية للدراسة",
    badge: "جديد ✨",
  },
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
    badge: "New ✨",
  },
  { label: "Text to Image", to: "/tools/image", description: "Generate AI images from prompts" },
  { label: "Article Summarizer", to: "/tools/summarize", description: "Fast AI summaries" },
  {
    label: "Smart Translator",
    to: "/tools/translate",
    description: "Accurate multi-language translation",
  },
  { label: "Idea Generator", to: "/tools/ideas", description: "Content & project ideas" },
  { label: "SEO Assistant", to: "/tools/seo", description: "Optimize search ranking" },
];

const SIMPLE_NAV_AR = [
  { to: "/", label: "الرئيسية" },
  { to: "/quiz", label: "اختبار AI" },
  { to: "/worldcup", label: "كأس العالم 2026" },
  { to: "/about", label: "عن الأكاديمية" },
  { to: "/contact", label: "تواصل" },
] as const;

const SIMPLE_NAV_EN = [
  { to: "/", label: "Home" },
  { to: "/posts", label: "Posts" },
  { to: "/lessons", label: "Courses" },
  { to: "/tools", label: "Tools" },
  { to: "/quiz", label: "AI Quiz" },
  { to: "/worldcup", label: "World Cup 2026" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [mPosts, setMPosts] = useState(false);
  const [mLessons, setMLessons] = useState(false);
  const [mTools, setMTools] = useState(false);
  const [lang, setLang] = useState<"ar" | "en">("ar");
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = (localStorage.getItem("bouiba_lang") as "ar" | "en") || "ar";
      setLang(saved);
      document.documentElement.lang = saved;
      document.documentElement.dir = saved === "ar" ? "rtl" : "ltr";
    }
  }, []);

  const switchLanguage = (newLang: "ar" | "en") => {
    setLang(newLang);
    if (typeof window !== "undefined") {
      localStorage.setItem("bouiba_lang", newLang);
      document.documentElement.lang = newLang;
      document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";

      const domain = window.location.hostname;
      if (newLang === "en") {
        document.cookie = `googtrans=/ar/en; path=/; domain=${domain}`;
        document.cookie = `googtrans=/ar/en; path=/`;
      } else {
        document.cookie = `googtrans=/ar/ar; path=/; domain=${domain}`;
        document.cookie = `googtrans=/ar/ar; path=/`;
      }
      window.location.reload();
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setAuthed(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setAuthed(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);

  // Block body scroll when mobile menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
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

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/60">
        {/* Header glassmorphism background */}
        <div className="absolute inset-0 -z-10 bg-background/80 backdrop-blur-md" />

        <div className="container-page flex h-16 items-center justify-between gap-4">
          <Link
            to="/"
            className="flex items-center gap-2.5 shrink-0 min-w-0"
            aria-label="Bouiba Academy"
          >
            <img
              src={bouibaLogo.url}
              alt="Bouiba Academy"
              className="h-8 w-8 sm:h-9 sm:w-9 md:h-9.5 md:w-9.5 object-contain"
              width={38}
              height={38}
              fetchPriority="high"
              decoding="async"
            />
            <span className="gradient-text font-display text-lg sm:text-xl font-extrabold tracking-tight select-none">
              Bouiba Academy
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-accent/60"
              activeOptions={{ exact: true }}
              activeProps={{ className: "text-foreground bg-accent/60" }}
            >
              {lang === "en" ? "Home" : "الرئيسية"}
            </Link>

            <NavDropdown
              label={lang === "en" ? "Articles" : "المقالات"}
              to="/posts"
              items={postItems}
              footer={{
                label: lang === "en" ? "View all articles" : "عرض جميع المقالات",
                to: "/posts",
              }}
              onLoad={() => {
                if (!labelsQ.data && !labelsQ.isFetching) labelsQ.refetch();
              }}
            />

            <NavDropdown
              label={lang === "en" ? "Courses" : "دورات"}
              to="/lessons"
              items={lessonItems}
              footer={{
                label: lang === "en" ? "View all courses" : "عرض كل الدورات",
                to: "/lessons",
              }}
              onLoad={() => {
                if (!lessonsQ.data && !lessonsQ.isFetching) lessonsQ.refetch();
              }}
            />

            <NavDropdown
              label={lang === "en" ? "AI Tools" : "أدوات AI"}
              to="/tools"
              items={lang === "en" ? TOOL_ITEMS_EN : TOOL_ITEMS_AR}
              footer={{
                label: lang === "en" ? "Browse all tools" : "استعرض كل الأدوات",
                to: "/tools",
              }}
              badge={true}
            />

            {(lang === "en" ? SIMPLE_NAV_EN : SIMPLE_NAV_AR).slice(1).map((item, i) => (
              <Link
                key={i}
                to={item.to}
                className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-accent/60"
                activeProps={{ className: "text-foreground bg-accent/60" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            {/* Language Switcher */}
            <button
              onClick={() => switchLanguage(lang === "ar" ? "en" : "ar")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-accent/30 px-2.5 py-1.5 text-xs font-bold text-foreground hover:bg-accent transition-all cursor-pointer"
              title={lang === "ar" ? "Switch to English" : "التحويل للغة العربية"}
            >
              <Globe className="h-3.5 w-3.5 text-primary" />
              <span>{lang === "ar" ? "EN" : "العربية"}</span>
            </button>

            {authed ? (
              <Link
                to="/favorites"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-semibold hover:bg-accent"
              >
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                {lang === "en" ? "Favorites" : "المفضلة"}
              </Link>
            ) : (
              <Link
                id="btn-login"
                to="/auth"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-semibold hover:bg-accent"
              >
                <LogIn className="h-4 w-4" />
                {lang === "en" ? "Login" : "دخول"}
              </Link>
            )}
            <Link
              to="/tools/roadmap"
              className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition-all hover:opacity-90 hover:shadow-elegant"
            >
              {lang === "en" ? "Start Learning" : "ابدأ التعلم"}
            </Link>
          </div>

          <button
            onClick={() => {
              const next = !open;
              setOpen(next);
              if (next) {
                if (!labelsQ.data && !labelsQ.isFetching) labelsQ.refetch();
                if (!lessonsQ.data && !lessonsQ.isFetching) lessonsQ.refetch();
              }
            }}
            className="md:hidden inline-flex items-center justify-center rounded-lg p-2.5 text-foreground hover:bg-accent transition-colors animate-in fade-in"
            aria-label="القائمة"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <div className="md:hidden border-t border-border/50">
          <div className="container-page py-2">
            <nav className="flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-0.5">
              {(lang === "en" ? SIMPLE_NAV_EN : SIMPLE_NAV_AR).map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="inline-flex shrink-0 items-center rounded-full border border-border bg-background/80 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-accent/60"
                  activeProps={{ className: "text-foreground bg-accent/60 border-primary/30" }}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation Menu */}
      {open && (
        <div className="fixed inset-0 z-[100] md:hidden flex justify-end">
          {/* Backdrop blur overlay */}
          <div
            className="absolute inset-0 bg-background/60 backdrop-blur-md transition-opacity duration-300"
            onClick={() => setOpen(false)}
          />

          {/* Drawer panel */}
          <div className="relative z-10 w-[85vw] max-w-sm h-full bg-background border-l border-border/50 shadow-2xl p-6 flex flex-col justify-between overflow-y-auto transition-transform duration-300">
            <div className="space-y-6">
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
                  aria-label="إغلاق القائمة"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="flex flex-col gap-2">
                <Link
                  to="/"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-all group"
                  activeOptions={{ exact: true }}
                  activeProps={{
                    className: "text-foreground bg-accent/40 border-r-2 border-primary",
                  }}
                >
                  <Home className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span>الرئيسية</span>
                </Link>

                <MobileGroup
                  label="المقالات"
                  open={mPosts}
                  onToggle={() => setMPosts((v) => !v)}
                  overviewTo="/posts"
                  onNavigate={() => setOpen(false)}
                  items={postItems}
                  icon={FileText}
                />

                <MobileGroup
                  label="دورات"
                  open={mLessons}
                  onToggle={() => setMLessons((v) => !v)}
                  overviewTo="/lessons"
                  onNavigate={() => setOpen(false)}
                  items={lessonItems}
                  icon={GraduationCap}
                />

                <MobileGroup
                  label="أدوات AI"
                  open={mTools}
                  onToggle={() => setMTools((v) => !v)}
                  overviewTo="/tools"
                  onNavigate={() => setOpen(false)}
                  items={TOOL_ITEMS_AR}
                  icon={Cpu}
                  badge={true}
                />

                <Link
                  to="/quiz"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-all group"
                  activeProps={{
                    className: "text-foreground bg-accent/40 border-r-2 border-primary",
                  }}
                >
                  <HelpCircle className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span>اختبار AI</span>
                </Link>

                <Link
                  to="/worldcup"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-all group"
                  activeProps={{
                    className: "text-foreground bg-accent/40 border-r-2 border-primary",
                  }}
                >
                  <Trophy className="h-5 w-5 text-amber-500" />
                  <span>كأس العالم 2026</span>
                </Link>

                <Link
                  to="/about"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-all group"
                  activeProps={{
                    className: "text-foreground bg-accent/40 border-r-2 border-primary",
                  }}
                >
                  <Info className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span>عن الأكاديمية</span>
                </Link>

                <Link
                  to="/contact"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-all group"
                  activeProps={{
                    className: "text-foreground bg-accent/40 border-r-2 border-primary",
                  }}
                >
                  <PhoneCall className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span>تواصل معنا</span>
                </Link>
              </nav>
            </div>

            {/* Drawer Footer Actions */}
            <div className="pt-6 border-t border-border/60 space-y-3">
              <button
                onClick={() => switchLanguage(lang === "ar" ? "en" : "ar")}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-border bg-accent/30 font-semibold text-foreground hover:bg-accent transition-colors cursor-pointer"
              >
                <Globe className="h-4 w-4 text-primary" />
                <span>{lang === "ar" ? "Switch to English 🇬🇧" : "التحويل للغة العربية 🇸🇦"}</span>
              </button>
              {authed ? (
                <Link
                  to="/favorites"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-border bg-accent/30 font-semibold text-amber-600 hover:bg-accent transition-colors"
                >
                  <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                  المفضلة
                </Link>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-border bg-accent/30 font-semibold text-foreground hover:bg-accent transition-colors"
                >
                  <LogIn className="h-4 w-4" />
                  تسجيل الدخول
                </Link>
              )}

              <Link
                to="/tools/roadmap"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-gradient-to-r from-primary to-purple-600 text-white font-bold shadow-lg shadow-primary/25 hover:opacity-95 text-center transition-all duration-300"
              >
                <Sparkles className="h-4.5 w-4.5 text-amber-300 animate-pulse" />
                ابدأ التعلم (مسار ذكي)
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
  items,
  onNavigate,
  icon: Icon,
  badge,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  overviewTo: string;
  items: NavDropdownItem[];
  onNavigate: () => void;
  icon: React.ComponentType<{ className?: string }>;
  badge?: boolean;
}) {
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
            صفحة {label} الرئيسية ←
          </Link>
          <div className="grid gap-1 mt-1">
            {items.length === 0 ? (
              <p className="px-3 py-2 text-xs text-muted-foreground">لا توجد عناصر حالياً</p>
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
