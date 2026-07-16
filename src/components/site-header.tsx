import { Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Menu, X, Star, LogIn, ChevronDown, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getLabels } from "@/lib/blogger.functions";
import { listLessons } from "@/lib/lessons.functions";
import { NavDropdown, type NavDropdownItem } from "@/components/nav-dropdown";
import bouibaLogo from "@/assets/bouiba-logo.webp.asset.json";

const TOOL_ITEMS: NavDropdownItem[] = [
  { label: "نص إلى صورة", to: "/tools/image", description: "توليد صور بالذكاء الاصطناعي", icon: "image" },
  { label: "تلخيص المقالات", to: "/tools/summarize", description: "ملخصات ذكية سريعة", icon: "file-text" },
  { label: "الترجمة الذكية", to: "/tools/translate", description: "ترجمة دقيقة بين اللغات", icon: "languages" },
  { label: "توليد الأفكار", to: "/tools/ideas", description: "أفكار محتوى ومشاريع", icon: "lightbulb" },
  { label: "مساعد SEO", to: "/tools/seo", description: "تحسين ترتيب موقعك", icon: "search" },
];

const SIMPLE_NAV = [
  { to: "/", label: "الرئيسية" },
  { to: "/quiz", label: "اختبار AI" },
  { to: "/worldcup", label: "كأس العالم 2026" },
  { to: "/about", label: "عن الأكاديمية" },
  { to: "/contact", label: "تواصل" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [mPosts, setMPosts] = useState(false);
  const [mLessons, setMLessons] = useState(false);
  const [mTools, setMTools] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setAuthed(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setAuthed(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  const postItems: NavDropdownItem[] = (labelsQ.data ?? []).slice(0, 10).map((l: { label: string; count: number }) => ({
    label: `${l.label}`,
    to: "/posts",
    search: { label: l.label },
    badge: l.count,
  }));

  const lessonCategories = Array.from(
    new Set((lessonsQ.data ?? []).map((l: { category?: string | null }) => l.category).filter(Boolean) as string[]),
  );
  const lessonItems: NavDropdownItem[] = lessonCategories.map((c) => ({
    label: c,
    to: "/lessons",
  }));

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "glass-header"
          : "border-b border-border/30 bg-background/60 backdrop-blur-xl"
      }`}
    >
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link to="/" className="group flex items-center gap-3 font-bold text-lg" aria-label="Bouiba Academy">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-full ring-2 ring-primary/20 bg-surface shadow-soft transition-all duration-300 group-hover:shadow-glow group-hover:ring-primary/40">
            <img
              src={bouibaLogo.url}
              alt="Bouiba Academy"
              className="h-7 w-auto"
              width={28}
              height={28}
              fetchPriority="high"
              decoding="async"
            />
          </div>
          <span className="hidden sm:block gradient-text font-display text-xl tracking-tight">Bouiba Academy</span>
        </Link>

        <nav className="hidden md:flex items-center gap-0.5">
          <Link
            to="/"
            className="nav-link"
            activeOptions={{ exact: true }}
            activeProps={{ className: "nav-link-active" }}
          >
            الرئيسية
          </Link>

          <NavDropdown
            label="المقالات"
            to="/posts"
            items={postItems}
            footer={{ label: "عرض جميع المقالات", to: "/posts" }}
            onLoad={() => { if (!labelsQ.data && !labelsQ.isFetching) labelsQ.refetch(); }}
          />

          <NavDropdown
            label="دورات"
            to="/lessons"
            items={lessonItems}
            footer={{ label: "عرض كل الدورات", to: "/lessons" }}
            onLoad={() => { if (!lessonsQ.data && !lessonsQ.isFetching) lessonsQ.refetch(); }}
          />

          <NavDropdown
            label="أدوات AI"
            to="/tools"
            items={TOOL_ITEMS}
            footer={{ label: "استعرض كل الأدوات", to: "/tools" }}
          />

          {SIMPLE_NAV.slice(1).map((item, i) => (
            <Link
              key={i}
              to={item.to}
              className="nav-link"
              activeProps={{ className: "nav-link-active" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2.5">
          {authed ? (
            <Link
              to="/favorites"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-surface px-3 py-2 text-sm font-semibold text-foreground shadow-card transition-all hover:bg-accent hover:shadow-soft"
            >
              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
              المفضلة
            </Link>
          ) : (
            <button
              onClick={() => navigate({ to: "/auth" })}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-surface px-3 py-2 text-sm font-semibold text-foreground shadow-card transition-all hover:bg-accent hover:shadow-soft"
            >
              <LogIn className="h-4 w-4 text-primary" />
              دخول
            </button>
          )}
          <Link to="/posts" className="btn-premium">
            <Sparkles className="h-4 w-4" />
            ابدأ التعلم
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
          className="md:hidden relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-surface text-foreground shadow-card transition-all hover:bg-accent hover:shadow-soft"
          aria-label="القائمة"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden absolute inset-x-0 top-full border-b border-border/40 glass-panel max-h-[80vh] overflow-y-auto animate-in slide-in-from-top-2 fade-in duration-200">
          <nav className="container-page flex flex-col py-4 gap-1">
            <Link
              to="/"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
            >
              <span className="h-2 w-2 rounded-full bg-primary/60" />
              الرئيسية
            </Link>

            <MobileGroup
              label="المقالات"
              open={mPosts}
              onToggle={() => setMPosts((v) => !v)}
              overviewTo="/posts"
              onNavigate={() => setOpen(false)}
              items={postItems}
            />

            <MobileGroup
              label="دورات"
              open={mLessons}
              onToggle={() => setMLessons((v) => !v)}
              overviewTo="/lessons"
              onNavigate={() => setOpen(false)}
              items={lessonItems}
            />

            <MobileGroup
              label="أدوات AI"
              open={mTools}
              onToggle={() => setMTools((v) => !v)}
              overviewTo="/tools"
              onNavigate={() => setOpen(false)}
              items={TOOL_ITEMS}
            />

            {SIMPLE_NAV.slice(1).map((item, i) => (
              <Link
                key={i}
                to={item.to}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
              >
                <span className="h-2 w-2 rounded-full bg-primary/60" />
                {item.label}
              </Link>
            ))}

            <div className="mt-3 flex flex-col gap-2 border-t border-border/40 pt-3">
              {authed ? (
                <Link
                  to="/favorites"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-lg border border-border/70 bg-surface px-4 py-2.5 text-sm font-semibold text-foreground shadow-card hover:bg-accent"
                >
                  <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                  المفضلة
                </Link>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-lg border border-border/70 bg-surface px-4 py-2.5 text-sm font-semibold text-foreground shadow-card hover:bg-accent"
                >
                  <LogIn className="h-4 w-4 text-primary" />
                  تسجيل الدخول
                </Link>
              )}
              <Link
                to="/posts"
                onClick={() => setOpen(false)}
                className="btn-premium justify-center"
              >
                <Sparkles className="h-4 w-4" />
                ابدأ التعلم
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

function MobileGroup({
  label,
  open,
  onToggle,
  overviewTo,
  items,
  onNavigate,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  overviewTo: string;
  items: NavDropdownItem[];
  onNavigate: () => void;
}) {
  return (
    <div className="rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-primary/60" />
          {label}
        </span>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      <div
        className={`grid transition-all duration-250 ease-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="mr-3 border-r border-border/60 pr-3 py-1 space-y-0.5">
            <Link
              to={overviewTo}
              onClick={onNavigate}
              className="block px-3 py-1.5 rounded-md text-sm font-semibold text-foreground hover:bg-accent transition-colors"
            >
              {label} — نظرة عامة
            </Link>
            {items.length === 0 ? (
              <p className="px-3 py-1.5 text-xs text-muted-foreground">لا توجد عناصر</p>
            ) : (
              items.map((it, i) => (
                <Link
                  key={i}
                  to={it.to}
                  search={it.search as never}
                  onClick={onNavigate}
                  className="block px-3 py-1.5 rounded-md text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                >
                  {it.label}
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
