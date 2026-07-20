import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ImageIcon,
  FileText,
  Lightbulb,
  Languages,
  Search,
  Sparkles,
  Trophy,
  Map,
  Code2,
  Star,
  ExternalLink,
  SlidersHorizontal,
  Info,
  Globe,
  Tag,
  DollarSign,
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import type { LucideIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AI_DIRECTORY_TOOLS, CATEGORIES_MAP, type AIDirectoryTool } from "@/lib/ai-directory-data";

export const Route = createFileRoute("/tools/")({
  component: ToolsIndex,
});

const TOOLS: Array<{
  to: string;
  icon: LucideIcon;
  title: string;
  desc: string;
  color: string;
  badge?: string;
}> = [
  {
    to: "/tools/image",
    icon: ImageIcon,
    title: "تحويل النص إلى صورة",
    desc: "أنشئ صورًا احترافية من وصف نصي بالعربية أو الإنجليزية باستخدام أحدث نماذج توليد الصور.",
    color: "from-blue-500/10 to-indigo-500/10 text-blue-500 dark:text-blue-400",
  },
  {
    to: "/tools/roadmap",
    icon: Map,
    title: "مستشار مسارات التعلم (Roadmap)",
    desc: "أدخل أي تخصص أو موضوع وسيقوم الـ AI بتوليد خريطة طريق تفاعلية ممتازة للتعلم مع مصادر مجانية.",
    color: "from-emerald-500/10 to-teal-500/10 text-emerald-500 dark:text-emerald-400",
  },
  {
    to: "/tools/prompt",
    icon: Sparkles,
    title: "مُصمم ومُحسن البرومبت الذكي",
    desc: "حوّل أوامرك البسيطة والقصيرة إلى أوامر (Prompts) احترافية ومهيكلة للحصول على أفضل النتائج.",
    color: "from-amber-500/10 to-orange-500/10 text-amber-500 dark:text-amber-400",
    badge: "جديد ✨",
  },
  {
    to: "/tools/code",
    icon: Code2,
    title: "مساعد البرمجة وشرح الأكواد",
    desc: "الصق أي كود برمجي للحصول على شرح تفصيلي له، وتحديد المشاكل، أو تصحيح الأخطاء مباشرة.",
    color: "from-purple-500/10 to-pink-500/10 text-purple-500 dark:text-purple-400",
    badge: "جديد ✨",
  },
  {
    to: "/tools/summarize",
    icon: FileText,
    title: "تلخيص المقالات",
    desc: "الصق أي مقال طويل واحصل على ملخّص عربي واضح في نقاط موجزة خلال ثوانٍ.",
    color: "from-cyan-500/10 to-blue-500/10 text-cyan-500 dark:text-cyan-400",
  },
  {
    to: "/tools/ideas",
    icon: Lightbulb,
    title: "مولّد أفكار المقالات",
    desc: "أدخل موضوعًا واحصل على عناوين مقالات جذابة ومحسّنة لموضوعك ومحركات البحث.",
    color: "from-yellow-500/10 to-amber-500/10 text-yellow-500 dark:text-yellow-400",
  },
  {
    to: "/tools/translate",
    icon: Languages,
    title: "الترجمة الاحترافية",
    desc: "ترجمة نصوص بين العربية والإنجليزية والفرنسية بأسلوب طبيعي واحترافي.",
    color: "from-indigo-500/10 to-purple-500/10 text-indigo-500 dark:text-indigo-400",
  },
  {
    to: "/tools/seo",
    icon: Search,
    title: "مساعد SEO عربي",
    desc: "احصل على عنوان، وصف Meta، كلمات مفتاحية، وهيكل عناوين محسّن لموضوعك.",
    color: "from-rose-500/10 to-red-500/10 text-rose-500 dark:text-rose-400",
  },
];

function ToolsIndex() {
  const [activeTab, setActiveTab] = useState<"integrated" | "directory">("integrated");
  const [enabledKeys, setEnabledKeys] = useState<Set<string> | null>(null);

  // Directory Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPricing, setSelectedPricing] = useState<string>("all");

  useEffect(() => {
    supabase
      .from("admin_ai_tools")
      .select("tool_key,enabled")
      .then(({ data }) => {
        if (!data) return setEnabledKeys(null);
        setEnabledKeys(new Set(data.filter((t) => t.enabled).map((t) => t.tool_key)));
      });
  }, []);

  const visibleTools = TOOLS.filter((t) => {
    if (!enabledKeys) return true;
    const key = t.to.replace("/tools/", "");
    if (key === "roadmap" && !enabledKeys.has("roadmap")) return true;
    if (key === "prompt" && !enabledKeys.has("prompt")) return true;
    if (key === "code" && !enabledKeys.has("code")) return true;
    return enabledKeys.has(key);
  });

  // Filter external directory tools
  const filteredDirectoryTools = useMemo(() => {
    return AI_DIRECTORY_TOOLS.filter((tool) => {
      const matchesSearch =
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tool.arabicName && tool.arabicName.includes(searchQuery)) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.tags.some((tag) => tag.includes(searchQuery));

      const matchesCategory = selectedCategory === "all" || tool.category === selectedCategory;
      const matchesPricing = selectedPricing === "all" || tool.pricing === selectedPricing;

      return matchesSearch && matchesCategory && matchesPricing;
    });
  }, [searchQuery, selectedCategory, selectedPricing]);

  return (
    <>
      {/* HERO SECTION */}
      <section className="hero-bg border-b border-border">
        <div className="container-page py-16 md:py-24 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-4 py-1.5 text-xs font-medium text-muted-foreground mb-4 shadow-soft">
            <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
            أكبر منصة ودليل لأدوات الذكاء الاصطناعي بالعربية
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-extrabold leading-tight">
            أدوات <span className="gradient-text">الذكاء الاصطناعي</span>
          </h1>
          <p className="mt-4 text-base md:text-lg text-muted-foreground leading-relaxed">
            استكشف أدوات AI التفاعلية المدمجة في موقعنا، وتصفّح دليلاً شاملاً لأقوى أدوات الذكاء
            الاصطناعي العالمية مع مراجعات عربية.
          </p>

          {/* TAB TOGGLE CONTROLLER */}
          <div className="mt-10 inline-flex p-1.5 bg-accent/40 backdrop-blur rounded-2xl border border-border shadow-soft">
            <button
              onClick={() => setActiveTab("integrated")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                activeTab === "integrated"
                  ? "bg-background text-foreground shadow-elegant ring-1 ring-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sparkles className="h-4 w-4" />
              أدواتنا المدمجة
            </button>
            <button
              onClick={() => setActiveTab("directory")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                activeTab === "directory"
                  ? "bg-background text-foreground shadow-elegant ring-1 ring-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Globe className="h-4 w-4" />
              دليل الأدوات العالمي
            </button>
          </div>
        </div>
      </section>

      {activeTab === "integrated" ? (
        <>
          {/* TAB 1: INTEGRATED INTERACTIVE TOOLS */}
          <section className="container-page pt-10 md:pt-14">
            <Link
              to="/quiz"
              className="group relative flex flex-col md:flex-row items-center gap-6 overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary-glow/5 to-transparent p-6 md:p-8 shadow-elegant transition-all duration-300 hover:-translate-y-1 hover:border-primary/30"
            >
              <div className="inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-background shadow-soft ring-1 ring-border">
                <Trophy className="h-8 w-8 text-primary animate-pulse" />
              </div>
              <div className="flex-1 text-center md:text-right">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-0.5 text-xs font-bold text-primary mb-2">
                  جديد ✨
                </div>
                <h2 className="font-display text-2xl md:text-3xl font-extrabold text-foreground group-hover:text-primary transition-colors">
                  اختبار: ما أداة الذكاء الاصطناعي المناسبة لك؟
                </h2>
                <p className="mt-1 text-muted-foreground text-sm leading-relaxed">
                  6 أسئلة سريعة وتوصية شخصية بأفضل أداة AI تناسب احتياجاتك العملية أو التعليمية.
                </p>
              </div>
              <span className="inline-flex items-center rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-soft group-hover:opacity-90 transition-all">
                ابدأ الاختبار ←
              </span>
            </Link>
          </section>

          <section className="container-page py-14 md:py-20">
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {visibleTools.map((t) => (
                <Link
                  key={t.to}
                  to={t.to}
                  className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:shadow-elegant hover:border-primary/20 hover:-translate-y-1"
                >
                  <div
                    className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${t.color} shadow-soft group-hover:scale-105 transition-transform duration-300`}
                  >
                    <t.icon className="h-6 w-6" />
                  </div>
                  {t.badge && (
                    <span className="absolute top-4 left-4 inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                      {t.badge}
                    </span>
                  )}
                  <h2 className="mt-4 font-display text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {t.title}
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed min-h-[40px]">
                    {t.desc}
                  </p>
                  <span className="mt-4 inline-block text-sm font-semibold text-primary group-hover:underline">
                    جرّبها الآن ←
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </>
      ) : (
        <>
          {/* TAB 2: GLOBAL AI DIRECTORY */}
          <section className="container-page py-10">
            <div className="bg-card/50 backdrop-blur rounded-2xl border border-border p-5 md:p-6 shadow-soft mb-8">
              <div className="flex flex-col gap-4">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="ابحث عن أداة (مثال: Midjourney, ChatGPT, لوفابل...)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-4 pr-11 py-3 text-base rounded-xl border border-border bg-background/80 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  {/* Category Filter Title */}
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    تصفية حسب:
                  </div>

                  {/* Pricing Filters */}
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => setSelectedPricing("all")}
                      className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                        selectedPricing === "all"
                          ? "bg-foreground text-background border-foreground"
                          : "bg-background text-muted-foreground border-border hover:border-muted"
                      }`}
                    >
                      كل الأسعار
                    </button>
                    <button
                      onClick={() => setSelectedPricing("free")}
                      className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                        selectedPricing === "free"
                          ? "bg-emerald-600 text-white border-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30"
                          : "bg-background text-muted-foreground border-border hover:border-muted"
                      }`}
                    >
                      مجاني
                    </button>
                    <button
                      onClick={() => setSelectedPricing("freemium")}
                      className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                        selectedPricing === "freemium"
                          ? "bg-blue-600 text-white border-blue-600 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30"
                          : "bg-background text-muted-foreground border-border hover:border-muted"
                      }`}
                    >
                      فريميوم
                    </button>
                    <button
                      onClick={() => setSelectedPricing("paid")}
                      className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                        selectedPricing === "paid"
                          ? "bg-amber-600 text-white border-amber-600 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30"
                          : "bg-background text-muted-foreground border-border hover:border-muted"
                      }`}
                    >
                      مدفوع
                    </button>
                  </div>
                </div>

                {/* Category Pills */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-border/50">
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      selectedCategory === "all"
                        ? "bg-primary text-primary-foreground shadow-soft"
                        : "bg-background border border-border text-muted-foreground hover:text-foreground hover:border-muted"
                    }`}
                  >
                    الكل ({AI_DIRECTORY_TOOLS.length})
                  </button>
                  {Object.entries(CATEGORIES_MAP).map(([key, label]) => {
                    const count = AI_DIRECTORY_TOOLS.filter((t) => t.category === key).length;
                    return (
                      <button
                        key={key}
                        onClick={() => setSelectedCategory(key)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                          selectedCategory === key
                            ? "bg-primary text-primary-foreground shadow-soft"
                            : "bg-background border border-border text-muted-foreground hover:text-foreground hover:border-muted"
                        }`}
                      >
                        {label} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* RESULTS STATE */}
            <div className="flex items-center justify-between mb-6">
              <div className="text-sm text-muted-foreground">
                تم العثور على{" "}
                <span className="font-semibold text-foreground">
                  {filteredDirectoryTools.length}
                </span>{" "}
                أداة
              </div>
            </div>

            {filteredDirectoryTools.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filteredDirectoryTools.map((tool) => (
                  <div
                    key={tool.name}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:shadow-elegant hover:border-primary/20 hover:-translate-y-1"
                  >
                    <div>
                      {/* Top Row: Name and Pricing */}
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-display text-lg font-extrabold text-foreground flex items-center gap-1.5 flex-wrap">
                          {tool.name}
                          {tool.arabicName && (
                            <span className="text-xs font-normal text-muted-foreground">
                              ({tool.arabicName})
                            </span>
                          )}
                        </h3>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            tool.pricing === "free"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : tool.pricing === "freemium"
                                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          }`}
                        >
                          {tool.pricing === "free"
                            ? "مجاني"
                            : tool.pricing === "freemium"
                              ? "فريميوم"
                              : "مدفوع"}
                        </span>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-1 mt-1.5 text-amber-500 text-xs font-bold">
                        <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                        <span>{tool.rating.toFixed(1)}</span>
                      </div>

                      {/* Description */}
                      <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-3">
                        {tool.description}
                      </p>
                    </div>

                    <div>
                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mt-4">
                        {tool.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center text-[10px] font-medium text-muted-foreground bg-accent/50 px-2 py-0.5 rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between mt-5 pt-4 border-t border-border/50">
                        <span className="text-[11px] text-primary/80 font-bold bg-primary/5 px-2 py-1 rounded">
                          {CATEGORIES_MAP[tool.category]}
                        </span>
                        <a
                          href={tool.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground hover:text-primary transition-colors group/link"
                        >
                          زيارة الموقع
                          <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover/link:translate-x-[-2px] group-hover/link:translate-y-[-2px]" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 rounded-2xl border border-dashed border-border bg-card/20">
                <Info className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                <h3 className="text-lg font-bold text-foreground">لم نجد أي نتائج</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                  حاول تغيير كلمات البحث أو إلغاء فلاتر التصفية للعثور على أدوات أخرى.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                    setSelectedPricing("all");
                  }}
                  className="mt-4 inline-flex items-center justify-center rounded-xl bg-primary text-primary-foreground px-4 py-2 text-xs font-bold shadow-soft transition hover:opacity-90"
                >
                  إعادة تعيين الفلاتر
                </button>
              </div>
            )}
          </section>
        </>
      )}
    </>
  );
}
