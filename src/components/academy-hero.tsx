import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Search,
  CheckCircle2,
  Cpu,
  Bot,
  Zap,
  Code2,
  Terminal,
  ShieldCheck,
  Star,
  Activity,
} from "lucide-react";
import { useLang } from "@/hooks/use-lang";
import { Hero3DCanvas } from "@/components/hero-3d-canvas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";

interface TrackData {
  id: string;
  title: string;
  badge: string;
  icon: typeof Cpu;
  level: string;
  duration: string;
  activeStudents: string;
  progress: number;
  description: string;
  tags: string[];
  workflowSnippet: string;
  highlightMetric: string;
}

const TRACKS: Record<string, TrackData> = {
  n8n: {
    id: "n8n",
    title: "مسار أتمتة العمليات وn8n",
    badge: "الأكثر طلباً 🔥",
    icon: Zap,
    level: "من المبتدئ إلى المحترف",
    duration: "14 ساعة تطبيقية",
    activeStudents: "مئات المتعلمين",
    progress: 85,
    description: "بناء مسارات عمل تلقائية معقّدة، ربط الـ APIs، وأتمتة المهام اليومية باستخدام n8n وMake بدون تعقيد.",
    tags: ["n8n", "Make", "Webhooks", "REST API", "Automation"],
    workflowSnippet: `// workflow: Auto-AI Article Generator
Trigger: New Webhook Event ⚡
 -> Fetch Topic Metadata
 -> Execute DeepSeek / OpenAI Node
 -> Format Markdown & Publish to Blogger
Status: 200 OK (Executed in 420ms)`,
    highlightMetric: "وفر أكثر من 15 ساعة أسبوعياً",
  },
  ai_agents: {
    id: "ai_agents",
    title: "وكلاء الذكاء الاصطناعي (AI Agents)",
    badge: "جديد 🤖",
    icon: Bot,
    level: "متقدم",
    duration: "18 ساعة تطبيقية",
    activeStudents: "آلاف المتعلمين",
    progress: 72,
    description: "بناء واستضافة وكلاء ذكاء اصطناعي محليين باستخدام Ollama وLangChain وتخصيص النماذج مجاناً.",
    tags: ["Ollama", "LangChain", "Python", "DeepSeek-R1", "RAG"],
    workflowSnippet: `// Agent: Bouiba Academic Assistant
AgentInit(model: "ollama/deepseek-r1:8b")
Memory: VectorDB (ChromaDB Enabled)
Tool: WebSearch + Document Parser
Output: Instant Arabic Technical Summary ✅`,
    highlightMetric: "تشغيل النماذج محلياً 100% مجاناً",
  },
  web_dev: {
    id: "web_dev",
    title: "تطوير تطبيقات الويب الذكية",
    badge: "شامل 🚀",
    icon: Code2,
    level: "متوسط",
    duration: "22 ساعة تطبيقية",
    activeStudents: "مجتمع نشط ومتنامٍ",
    progress: 90,
    description: "تطوير تطبيقات حديثة باستعمال React, TypeScript, TanStack Start ودمج قدرات الذكاء الاصطناعي.",
    tags: ["React 19", "TypeScript", "TanStack", "Tailwind v4", "Vite"],
    workflowSnippet: `// Component: SmartAIChatBox.tsx
useQuery({ queryKey: ["ai-completion"] })
Response stream active ⚡
Tailwind v4 theme applied (RTL First)
Build Status: Clean (0 errors)`,
    highlightMetric: "بناء تطبيقات حقيقية قابلة للنشر",
  },
};

export function AcademyHero() {
  const { t, isRTL } = useLang();
  const navigate = useNavigate();
  const [activeTrack, setActiveTrack] = useState<string>("n8n");
  const [searchQuery, setSearchQuery] = useState("");

  const ArrowDir = isRTL ? ArrowLeft : ArrowRight;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate({ to: "/posts", search: { q: searchQuery.trim() } });
    }
  };

  return (
    <section className="relative overflow-hidden border-b border-border/80 bg-surface-muted/60 py-12 md:py-20 lg:py-24">
      {/* 3D Neural Canvas Background */}
      <Hero3DCanvas />

      {/* Decorative Glow Orbs */}
      <div
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-primary/10 blur-[120px] rounded-full"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-1/3 -right-20 w-[400px] h-[400px] bg-violet-500/10 blur-[140px] rounded-full"
        aria-hidden="true"
      />

      <div className="container-page relative z-10 mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* RIGHT COLUMN (RTL): Headline, Value Prop & Search */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-start">
            
            {/* Top Glowing Status Badge using shadcn/ui Badge */}
            <Badge
              variant="outline"
              className="inline-flex items-center gap-2.5 rounded-full border-primary/25 bg-card/90 backdrop-blur-md px-4 py-1.5 text-xs md:text-sm font-bold text-primary shadow-soft transition-all hover:border-primary/40"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
              </span>
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>{t("hero.badge")}</span>
            </Badge>

            {/* Main Editorial Headline */}
            <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-black leading-[1.15] tracking-tight text-foreground">
              {t("hero.title")}{" "}
              <span className="bg-gradient-to-r from-primary via-teal-400 to-emerald-400 bg-clip-text text-transparent drop-shadow-sm">
                {t("hero.title.highlight")}
              </span>
            </h1>

            {/* Editorial Subtitle */}
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed font-normal max-w-2xl mx-auto lg:mx-0">
              {t("hero.subtitle")}
            </p>

            {/* Quick Search Form using shadcn/ui Input and Button */}
            <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto lg:mx-0 relative pt-2">
              <div className="relative flex items-center">
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("hero.search.placeholder")}
                  className="w-full rounded-2xl border-border/80 bg-card/90 backdrop-blur-md px-5 py-6 text-sm font-medium text-foreground placeholder:text-muted-foreground shadow-card transition-all focus-visible:ring-primary/20 pe-28"
                  aria-label={t("hero.search.placeholder")}
                />
                <Button
                  type="submit"
                  size="sm"
                  className="absolute inset-y-1.5 end-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-soft hover:bg-primary/90 cursor-pointer"
                >
                  <Search className="h-4 w-4 me-1" />
                  <span>{t("hero.search.button")}</span>
                </Button>
              </div>
              
              {/* Trending Topics Pills using shadcn/ui Badge */}
              <div className="flex items-center justify-center lg:justify-start gap-2 flex-wrap mt-3 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground/80 flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  {t("hero.trending")}:
                </span>
                {["n8n", "Make", "Ollama", "DeepSeek", "Python", "Google Cloud"].map((topic) => (
                  <Link
                    key={topic}
                    to="/posts"
                    search={{ q: topic }}
                  >
                    <Badge
                      variant="outline"
                      className="rounded-lg bg-surface border-border/60 hover:border-primary/40 hover:text-primary hover:bg-primary/5 cursor-pointer font-normal"
                    >
                      #{topic}
                    </Badge>
                  </Link>
                ))}
              </div>
            </form>

            {/* Action Buttons using shadcn/ui Button */}
            <div className="flex items-center justify-center lg:justify-start gap-3 flex-wrap pt-2">
              <Button
                asChild
                size="lg"
                className="rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-glow hover:bg-primary/90 hover:shadow-glow-strong hover:scale-[1.02] active:scale-[0.98]"
              >
                <Link to="/lessons">
                  <span>{t("auth.startLearning")}</span>
                  <ArrowDir className="h-4 w-4 ms-2" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-xl border-border/80 bg-card/90 backdrop-blur-md px-5 py-3.5 text-sm font-bold text-foreground shadow-card hover:border-primary/40 hover:bg-surface hover:text-primary"
              >
                <Link to="/tools">
                  <Cpu className="h-4 w-4 text-primary me-2" />
                  <span>{t("card.tryTool")}</span>
                </Link>
              </Button>
            </div>

            {/* Key Value Micro Features */}
            <div className="pt-4 border-t border-border/50 grid grid-cols-3 gap-3 text-start max-w-lg mx-auto lg:mx-0">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="text-xs font-semibold text-foreground/90">شروحات عربية 100%</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="text-xs font-semibold text-foreground/90">تطبيقات عملية واقعية</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="text-xs font-semibold text-foreground/90">أدوات مجانية تفاعلية</span>
              </div>
            </div>

          </div>

          {/* LEFT COLUMN (RTL): Interactive Platform Mockup Card */}
          <div className="lg:col-span-5 relative">
            
            {/* Floating Top Metric Pill */}
            <div className="absolute -top-5 -end-4 z-20 hidden sm:flex items-center gap-2.5 rounded-2xl border border-amber-500/30 bg-card/95 backdrop-blur-xl px-4 py-2.5 shadow-amber-glow animate-bounce-slow">
              <div className="rounded-xl bg-amber-500/15 p-2 text-amber-500">
                <Star className="h-4 w-4 fill-amber-500" />
              </div>
              <div>
                <div className="flex items-center gap-1 text-xs font-black text-foreground">
                  <span>محتوى يومي موثوق</span>
                  <span className="text-amber-500 font-bold">✓</span>
                </div>
                <div className="text-[11px] text-muted-foreground font-medium">قراء من 15+ دولة عربية</div>
              </div>
            </div>

            {/* Main Interactive Mockup using shadcn/ui Card & Tabs */}
            <Card className="relative rounded-3xl border-border/90 bg-card/95 backdrop-blur-2xl p-5 md:p-6 shadow-elegant transition-all hover:border-primary/30">
              <CardHeader className="p-0 pb-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-3 w-3 rounded-full bg-red-500/80" />
                    <span className="flex h-3 w-3 rounded-full bg-amber-500/80" />
                    <span className="flex h-3 w-3 rounded-full bg-emerald-500/80" />
                    <span className="text-xs font-mono text-muted-foreground ms-2">bouiba-academy://tracks</span>
                  </div>
                  <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-500 font-bold text-[11px]">
                    <Activity className="h-3 w-3 me-1 animate-pulse" />
                    مباشر ⚡
                  </Badge>
                </div>

                {/* Track Switcher Navigation using shadcn/ui Tabs */}
                <Tabs value={activeTrack} onValueChange={setActiveTrack} className="w-full">
                  <TabsList className="grid grid-cols-3 h-11 rounded-2xl bg-surface-muted/90 p-1 border border-border/60">
                    {Object.values(TRACKS).map((tItem) => {
                      const Icon = tItem.icon;
                      return (
                        <TabsTrigger
                          key={tItem.id}
                          value={tItem.id}
                          className="rounded-xl py-1.5 text-xs font-bold transition-all data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-card border-0"
                        >
                          <Icon className="h-3.5 w-3.5 me-1" />
                          <span className="truncate">{tItem.id === "n8n" ? "n8n & Make" : tItem.id === "ai_agents" ? "AI Agents" : "Full-Stack AI"}</span>
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>

                  {Object.values(TRACKS).map((trackItem) => (
                    <TabsContent key={trackItem.id} value={trackItem.id} className="mt-4 space-y-4">
                      {/* Active Track Card Content */}
                      <div className="space-y-4 rounded-2xl border border-border/70 bg-surface/80 p-4">
                        
                        {/* Title & Badge */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <Badge className="bg-primary/10 text-primary border-transparent hover:bg-primary/20 text-[11px] mb-1 font-bold">
                              {trackItem.badge}
                            </Badge>
                            <CardTitle className="text-base font-bold text-foreground">
                              {trackItem.title}
                            </CardTitle>
                          </div>
                          <Badge variant="outline" className="text-xs font-medium text-muted-foreground bg-surface-muted px-2.5 py-1 rounded-lg border-border/50">
                            {trackItem.duration}
                          </Badge>
                        </div>

                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {trackItem.description}
                        </p>

                        {/* Progress Bar using shadcn/ui Progress */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[11px] font-semibold text-muted-foreground">
                            <span>معدل إكمال التطبيقات الحية</span>
                            <span className="text-primary font-bold">{trackItem.progress}%</span>
                          </div>
                          <Progress value={trackItem.progress} className="h-2" />
                        </div>

                        {/* Live Code / Workflow Terminal Preview */}
                        <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-start font-mono text-[11px] text-teal-300 shadow-inner overflow-x-auto dir-ltr">
                          <div className="flex items-center justify-between text-slate-500 text-[10px] mb-1.5 pb-1 border-b border-slate-800/80">
                            <span className="flex items-center gap-1">
                              <Terminal className="h-3 w-3 text-teal-400" />
                              execution-preview.log
                            </span>
                            <span className="text-emerald-400">● RUNNING</span>
                          </div>
                          <pre className="whitespace-pre-wrap leading-relaxed text-slate-300">
                            {trackItem.workflowSnippet}
                          </pre>
                        </div>

                        {/* Tool Badges */}
                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                          {trackItem.tags.map((tg) => (
                            <Badge
                              key={tg}
                              variant="outline"
                              className="rounded-md border-border/60 bg-card px-2 py-0.5 text-[10px] font-semibold text-muted-foreground"
                            >
                              {tg}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Bottom Track CTA */}
                      <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground font-medium">
                          💡 {trackItem.highlightMetric}
                        </span>
                        <Link
                          to="/lessons"
                          className="inline-flex items-center gap-1 text-primary font-bold hover:underline"
                        >
                          <span>عرض الدروس</span>
                          <ArrowDir className="h-3.5 w-3.5 ms-1" />
                        </Link>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardHeader>
            </Card>

            {/* Floating Bottom Metric Pill */}
            <div className="absolute -bottom-6 -start-4 z-20 hidden sm:flex items-center gap-2.5 rounded-2xl border border-primary/30 bg-card/95 backdrop-blur-xl px-4 py-2.5 shadow-glow">
              <div className="rounded-xl bg-primary/15 p-2 text-primary">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-black text-foreground">تطبيقات حقيقية 100%</div>
                <div className="text-[11px] text-muted-foreground font-medium">مشاريع جاهزة للاستخدام</div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
