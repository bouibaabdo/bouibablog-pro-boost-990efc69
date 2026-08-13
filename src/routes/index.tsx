import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Wand2,
  Image as ImageIcon,
  Languages,
  FileText,
  Newspaper,
  Search,
  Compass,
  BarChart3,
  Clock,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Tag,
  Code2,
  Send,
  Layers,
} from "lucide-react";
import { getPosts, getLabels, optimizeBloggerImage } from "@/lib/blogger.functions";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PostCard } from "@/components/post-card";
import { TodayMatchesRail } from "@/components/today-matches-rail";
import { Hero3DCanvas } from "@/components/hero-3d-canvas";
import { Tilt3DCard } from "@/components/interactive-3d-card";
import { SectionHeader } from "@/components/section-header";
import { AcademyHero } from "@/components/academy-hero";
import { useLang } from "@/hooks/use-lang";
import { toast } from "sonner";


const postsQueryOptions = queryOptions({
  queryKey: ["posts", "home"],
  queryFn: () => getPosts({ data: { max: 12 } }),
  staleTime: 5 * 60_000,
});

const labelsQueryOptions = queryOptions({
  queryKey: ["labels"],
  queryFn: () => getLabels(),
  staleTime: 10 * 60_000,
});

function formatDate(iso: string, locale = "ar-EG-u-nu-latn") {
  try {
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    const [data] = await Promise.all([
      context.queryClient.ensureQueryData(postsQueryOptions),
      context.queryClient.ensureQueryData(labelsQueryOptions),
    ]);
    const featured = data.posts[0];
    const lcp = featured ? optimizeBloggerImage(featured.thumbnail, 1200, 675) : "";
    return { lcp };
  },
  head: ({ loaderData }) => {
    const title = "Bouiba Academy — الذكاء الاصطناعي والأتمتة";
    const desc =
      "منصة تقنية عربية مستقلة تقدم شروحات عملية، مراجعات محايدة، أدوات ذكاء اصطناعي تفاعلية مجانية، وأحدث التطورات في الذكاء الاصطناعي والأتمتة.";
    return {
      meta: [
        { title },
        { name: "description", content: desc, key: "description" },
        { property: "og:title", content: title, key: "og:title" },
        { property: "og:description", content: desc, key: "og:description" },
        { property: "og:url", content: "https://www.bouibacademy.me/", key: "og:url" },
        { name: "twitter:title", content: title, key: "twitter:title" },
        { name: "twitter:description", content: desc, key: "twitter:description" },
      ],
      links: [
        { rel: "canonical", href: "https://www.bouibacademy.me/" },
        ...(loaderData?.lcp
          ? [
              {
                rel: "preload",
                as: "image",
                href: loaderData.lcp,
                fetchpriority: "high",
              } as unknown as { rel: string; href: string },
            ]
          : []),
      ],
    };
  },
  component: HomePage,
  errorComponent: ({ error }) => (
    <div className="p-10 text-center text-muted-foreground">
      تعذر تحميل المحتوى: {error.message}
    </div>
  ),
});

const TOOL_CARDS = [
  {
    href: "/tools/image",
    title: "توليد الصور بالذكاء الاصطناعي",
    desc: "تحويل الأوصاف النصية العربية والإنجليزية إلى تصاميم ورسومات عالية الدقة بضغطة زر.",
    icon: ImageIcon,
    badge: "أداة تفاعلية 🖼️",
    cta: "تجربة التوليد",
  },
  {
    href: "/tools/roadmap",
    title: "مستشار مسارات التعلم التفاعلي",
    desc: "خريطة طريق دراسية وهندسية مخصصة لاحتراف تخصصات البرمجة والذكاء الاصطناعي والأتمتة.",
    icon: Compass,
    badge: "توجيه ذكي 🗺️",
    cta: "استكشف المسار",
  },
  {
    href: "/tools/summarize",
    title: "تلخيص المقالات والوثائق",
    desc: "استخلاص النقاط الرئيسية والأفكار الجوهرية من المقالات المستندات الطويلة خلال ثوانٍ.",
    icon: FileText,
    badge: "ملخص مكثف 📄",
    cta: "لخّص النص",
  },
  {
    href: "/tools/code",
    title: "مساعد البرمجة وشرح الأكواد",
    desc: "تحليل الأكواد البرمجية، شرح المنطق البرمجي، واكتشاف الثغرات وتصحيح الأخطاء فورياً.",
    icon: Code2,
    badge: "تكويد وDebug 💻",
    cta: "افحص الكود",
  },
  {
    href: "/tools/translate",
    title: "المترجم التقني الاحترافي",
    desc: "ترجمة دقيقة وطبيعية بين العربية والإنجليزية مع الحفاظ المصطلحات التقنية والهندسية.",
    icon: Languages,
    badge: "ترجمة دقيقة 🌐",
    cta: "ابدأ الترجمة",
  },
  {
    href: "/tools/seo",
    title: "مساعد السيو وتصدر البحث",
    desc: "صياغة عناوين متوافقة مع محركات البحث، وصف Meta، وكلمات مفتاحية مستهدفة لموقعك.",
    icon: BarChart3,
    badge: "تحسين SEO 🔍",
    cta: "حلّل محتواك",
  },
] as const;

function HomePage() {
  const { data } = useSuspenseQuery(postsQueryOptions);
  const { data: labels } = useSuspenseQuery(labelsQueryOptions);
  const [selectedCategory, setSelectedCategory] = useState<string>("الكل");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const navigate = useNavigate();
  const { t, lang, isRTL } = useLang();
  const ArrowDir = isRTL ? ArrowLeft : ArrowRight;
  const dateLocale = lang === "fr" ? "fr-FR" : lang === "en" ? "en-US" : "ar-EG-u-nu-latn";

  const posts = data.posts;
  const featured = posts[0];

  // Filter posts based on category selection
  const filteredPosts = useMemo(() => {
    if (selectedCategory === "الكل") {
      return posts.slice(1, 10);
    }
    return posts.filter(
      (p) =>
        p.labels.some((l) => l.toLowerCase() === selectedCategory.toLowerCase()) ||
        p.title.toLowerCase().includes(selectedCategory.toLowerCase()),
    );
  }, [posts, selectedCategory]);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim() && newsletterEmail.includes("@")) {
      setNewsletterSubscribed(true);
      toast.success("شكراً لانضمامك! تم تسجيل بريدك الإلكتروني في النشرة المعرفية بنجاح.");
    } else {
      toast.error("يرجى كتابة بريد إلكتروني صحيح.");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/15 selection:text-primary">
      <SiteHeader />
      <main>
        {/* HERO SECTION — Featuring Interactive Platform Mockup & 3D Neural Canvas Background */}
        <AcademyHero />

        {/* FEATURED COVER STORY WITH 3D TILT SHOWCASE (المقال الرئيسي التحريري) */}
        {featured && (
          <section className="container-page py-10 md:py-14 border-b border-border/60">
            <div className="flex items-center justify-between gap-4 mb-6">
              <SectionHeader
                title={t("section.featured")}
                badge={t("section.featuredSub")}
                icon={Layers}
                color="primary"
                size="md"
              />
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold hidden md:flex">
              </div>
            </div>

            <Tilt3DCard maxDegree={4} depth={12}>
              <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm hover:border-primary/40 transition-all duration-300">
                <Link
                  to="/posts/$id"
                  params={{ id: featured.slug }}
                  className="grid md:grid-cols-12 items-center gap-6 p-5 md:p-8"
                >
                  {/* Image Showcase */}
                  {featured.thumbnail && (
                    <div className="md:col-span-6 lg:col-span-5 h-64 md:h-80 rounded-xl overflow-hidden bg-surface-muted border border-border/60 relative">
                      <img
                        src={optimizeBloggerImage(featured.thumbnail, 800, 500)}
                        alt={featured.title}
                        loading="eager"
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-102"
                      />
                    </div>
                  )}

                  {/* Content Section */}
                  <div className="md:col-span-6 lg:col-span-7 space-y-4 py-2 text-right">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground font-semibold flex-wrap">
                      {featured.labels[0] && (
                        <span className="rounded-md bg-accent px-3 py-1 font-bold text-primary border border-primary/20">
                          {featured.labels[0]}
                        </span>
                      )}
                      <span>{formatDate(featured.published, dateLocale)}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {featured.readingMinutes} {t("card.minutes")}
                      </span>
                    </div>

                    <h3 className="font-display text-2xl md:text-4xl font-extrabold text-foreground leading-tight hover:text-primary transition-colors">
                      {featured.title}
                    </h3>

                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed line-clamp-3">
                      {featured.excerpt}
                    </p>

                    <div className="pt-2 flex items-center justify-between">
                      <div className="text-xs text-muted-foreground font-semibold">
                        {featured.author}
                      </div>
                      <div className="inline-flex items-center gap-1.5 text-sm font-bold text-primary">
                        <span>{t("card.readMore")}</span>
                        <ArrowDir className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </Tilt3DCard>
          </section>
        )}

        {/* LATEST ARTICLES & TUTORIALS */}
        <section className="container-page py-12 md:py-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-border/60 pb-6">
            <SectionHeader
              title={t("section.latestArticles")}
              icon={Newspaper}
              color="primary"
              size="lg"
              ctaTo="/posts"
              ctaLabel={t("nav.viewAllArticles")}
            />

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 flex-wrap text-xs font-semibold shrink-0">
              {[t("section.allCategories"), "AI Automation", "n8n", "Cybersecurity", "SEO", "Developer Tools"].map(
                (cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat === t("section.allCategories") ? "الكل" : cat)}
                    className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                      (cat === t("section.allCategories") && selectedCategory === "الكل") || selectedCategory === cat
                        ? "bg-primary text-primary-foreground border-primary font-bold"
                        : "bg-surface border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    }`}
                  >
                    {cat}
                  </button>
                ),
              )}
            </div>
          </div>

          {/* Grid of Articles with 3D Tilt Cards */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map((p, i) => (
              <PostCard key={p.id} post={p} priority={i < 3} />
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/posts"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-bold text-foreground shadow-sm hover:border-primary hover:text-primary transition-all"
            >
              <span>{t("nav.viewAllArticles")}</span>
              <ArrowDir className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* AI TOOLS SECTION — Interactive 3D Tilt Cards */}
        <section className="bg-surface-muted/50 border-y border-border/80 py-12 md:py-18">
          <div className="container-page">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
              <SectionHeader
                title={t("section.aiTools")}
                subtitle={t("section.aiToolsSub")}
                icon={Wand2}
                color="violet"
                size="lg"
                ctaTo="/tools"
                ctaLabel={`${t("nav.viewAllTools")} (${TOOL_CARDS.length})`}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {TOOL_CARDS.map((t) => (
                <Tilt3DCard key={t.href} maxDegree={6} depth={15}>
                  <Link
                    to={t.href}
                    className="group rounded-2xl border border-border bg-card p-6 shadow-sm hover:border-primary/50 hover:shadow-md transition-all flex flex-col justify-between h-full"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <t.icon className="h-6 w-6" />
                        </div>
                        <span className="rounded-md border border-border bg-surface-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                          {t.badge}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <h3 className="font-display text-lg font-extrabold text-foreground group-hover:text-primary transition-colors">
                          {t.title}
                        </h3>
                        <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                          {t.desc}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between text-xs font-bold text-primary">
                      <span>{t.cta}</span>
                      <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    </div>
                  </Link>
                </Tilt3DCard>
              ))}
            </div>
          </div>
        </section>

        {/* HIGH-TRUST NEWSLETTER SUBSCRIPTION BLOCK */}
        <section className="container-page py-12 md:py-16">
          <div className="rounded-3xl border border-border bg-card p-8 md:p-12 shadow-sm max-w-4xl mx-auto">
            <div className="grid md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-7 space-y-3">
                <div className="inline-flex items-center gap-2 rounded-md bg-accent px-3 py-1 text-xs font-bold text-primary border border-primary/20">
                  <Mail className="h-3.5 w-3.5" />
                  <span>{t("section.newsletter")}</span>
                </div>
                <h3 className="font-display text-2xl md:text-3xl font-black text-foreground">
                  {t("section.newsletter")}
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                  {t("section.newsletterSub")}
                </p>
              </div>

              <div className="md:col-span-5">
                {newsletterSubscribed ? (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold space-y-1 text-center">
                    <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto mb-1" />
                    <div>{t("section.newsletterSuccess")}</div>
                  </div>
                ) : (
                  <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                    <div className="space-y-1.5">
                      <input
                        type="email"
                        value={newsletterEmail}
                        onChange={(e) => setNewsletterEmail(e.target.value)}
                        placeholder={t("section.newsletterPlaceholder")}
                        className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-xs md:text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs md:text-sm font-bold text-primary-foreground hover:opacity-90 transition-all cursor-pointer shadow-sm"
                    >
                      <Send className="h-4 w-4" />
                      <span>{t("section.newsletterCta")}</span>
                    </button>
                    <div className="text-[10px] text-muted-foreground text-center">
                      🔒 {lang === "fr" ? "Confidentialité garantie" : lang === "en" ? "Privacy guaranteed" : "نلتزم بالخصوصية التامة"}
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* TOPIC CATEGORIES CLOUD (معرض التصنيفات) */}
        {labels.length > 0 && (
          <section className="container-page pb-12">
            <div className="rounded-2xl border border-border/80 bg-surface-muted/40 p-6 md:p-10 text-center">
              <h3 className="font-display text-lg md:text-xl font-bold mb-2">
                استكشف المواضيع والتصنيفات المعرفية
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground max-w-lg mx-auto mb-6">
                انقر على التصنيف الذي تود قراءة شروحاته وتطبيقاته العملية:
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {labels.slice(0, 16).map((l) => (
                  <Link
                    key={l.label}
                    to="/posts"
                    search={{ label: l.label }}
                    className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-1.5 text-xs font-semibold hover:border-primary hover:text-primary transition-all shadow-sm"
                  >
                    <Tag className="h-3 w-3 text-primary" />
                    <span>{l.label}</span>
                    <span className="rounded bg-surface-muted px-1.5 py-0.5 text-[10px] text-muted-foreground font-mono">
                      {l.count}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* MINIMAL TODAY'S MATCHES DETAILS CARD */}
        <section className="container-page pb-12">
          <div className="max-w-xl mx-auto rounded-xl border border-border bg-card/60 p-4 shadow-sm">
            <details className="group">
              <summary className="flex items-center justify-between cursor-pointer list-none select-none">
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                  <Trophy className="h-3.5 w-3.5 text-amber-500" />
                  <span>جدول الرياضة (مباريات اليوم)</span>
                </div>
                <span className="text-[10px] text-primary group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </summary>
              <div className="mt-3 pt-3 border-t border-border/40">
                <TodayMatchesRail variant="article" max={4} />
              </div>
            </details>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
