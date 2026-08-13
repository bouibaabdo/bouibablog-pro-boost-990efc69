import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Zap,
  Bot,
  Code2,
  Sparkles,
  Compass,
  FileText,
  ImageIcon,
  Languages,
  CheckCircle2,
  Copy,
  Check,
  Play,
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  Terminal,
  Activity,
  Award,
  Layers,
  Cpu,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useLang } from "@/hooks/use-lang";
import { toast } from "sonner";

interface WorkflowStep {
  id: number;
  name: string;
  detail: string;
  status: "idle" | "running" | "completed";
}

export function BentoLearningGrid() {
  const { lang, isRtl } = useLang();

  // Selected Track State
  const [activeTrack, setActiveTrack] = useState<"n8n" | "ai_agents" | "web_dev">("n8n");

  // Workflow Simulator State
  const [isSimulating, setIsSimulating] = useState(false);
  const [stepIndex, setStepIndex] = useState(2); // default all steps done

  // Prompt Sandbox State
  const [promptText, setPromptText] = useState("");
  const [sandboxResult, setSandboxResult] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Copy state for daily tip
  const [copiedTip, setCopiedTip] = useState(false);

  const tracksData = {
    n8n: {
      title: lang === "ar" ? "مسار أتمتة العمليات وn8n" : "n8n & Process Automation Track",
      badge: "الأكثر طلباً",
      description:
        lang === "ar"
          ? "بناء مسارات عمل تلقائية معقّدة، ربط الـ APIs، وأتمتة المهام اليومية باستخدام n8n وMake."
          : "Build complex automated workflows, connect APIs, and automate tasks with n8n & Make.",
      metric: "وفر +15 ساعة أسبوعياً",
      tags: ["n8n", "Make", "Webhooks", "AI Nodes"],
      steps: [
        { id: 1, name: "Webhook Trigger", detail: "استقبال البيانات فورياً", status: "completed" },
        { id: 2, name: "AI Processing", detail: "تحليل النوايا بـ DeepSeek", status: "completed" },
        { id: 3, name: "Publish & Sync", detail: "نشر التحديثات تلقائياً", status: "completed" },
      ],
      link: "/lessons",
    },
    ai_agents: {
      title: lang === "ar" ? "وكلاء الذكاء الاصطناعي (AI Agents)" : "AI Agents & Autonomous Bots",
      badge: "تكنولوجيا حديثة",
      description:
        lang === "ar"
          ? "بناء واستضافة وكلاء ذكاء اصطناعي محليين باستخدام Ollama وLangChain مجاناً."
          : "Build and host local AI agents with Ollama, LangChain, and RAG architectures.",
      metric: "تشغيل محلي 100% مجاناً",
      tags: ["Ollama", "LangChain", "DeepSeek-R1", "VectorDB"],
      steps: [
        { id: 1, name: "Local LLM Init", detail: "تحميل نموذج Ollama", status: "completed" },
        { id: 2, name: "RAG Retrieval", detail: "بحث في قواعد المستندات", status: "completed" },
        { id: 3, name: "Agent Execution", detail: "اتخاذ القرار وتنفيذ المهمة", status: "completed" },
      ],
      link: "/lessons",
    },
    web_dev: {
      title: lang === "ar" ? "تطوير تطبيقات الويب الذكية" : "Smart Web Dev & Full-stack AI",
      badge: "شامل",
      description:
        lang === "ar"
          ? "تطوير تطبيقات حديثة باستعمال React, TypeScript, TanStack Start ودمج قدرات الـ AI."
          : "Build modern full-stack apps with React 19, TypeScript, TanStack & AI integrations.",
      metric: "تطبيقات حقيقية جاهزة للنشر",
      tags: ["React 19", "TypeScript", "TanStack", "Tailwind v4"],
      steps: [
        { id: 1, name: "App Structure", detail: "تكوين TanStack Start", status: "completed" },
        { id: 2, name: "Tailwind v4 Styling", detail: "تصميم RTL وفاخر", status: "completed" },
        { id: 3, name: "Production Deployment", detail: "نشر على Cloudflare/Vercel", status: "completed" },
      ],
      link: "/lessons",
    },
  };

  const currentTrack = tracksData[activeTrack];

  const handleSimulate = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setStepIndex(0);
    toast.info("جاري محاكاة سريعة لتنفيذ الـ Workflow...");

    setTimeout(() => {
      setStepIndex(1);
    }, 900);

    setTimeout(() => {
      setStepIndex(2);
      setIsSimulating(false);
      toast.success("تم نجاح التنفيذ المحاكى بنسبة 100% ⚡");
    }, 1800);
  };

  const handleTestPrompt = () => {
    if (!promptText.trim()) {
      toast.error("يرجى كتابة نص أو فكرة أولاً لتجربة المحاكي الذكي!");
      return;
    }
    setIsGenerating(true);
    setSandboxResult(null);

    setTimeout(() => {
      setIsGenerating(false);
      setSandboxResult(
        `✅ نتيجة المحاكاة للذكاء الاصطناعي:\n- العنوان المقترح: "دليل احتراف ${promptText}"\n- ملخص الأثر: أتمتة العملية وتوفير 75% من وقت التنفيذ.\n- التوصية: ربط الأداة بـ n8n Webhook لضمان الاستجابة التلقائية.`
      );
      toast.success("تم إنشاء المحاكاة بنجاح!");
    }, 1200);
  };

  const handleCopyTip = () => {
    const tipText = `// n8n Webhook -> DeepSeek Prompt Automation\nconst payload = { topic: "AI Automation", model: "deepseek-r1" };\nfetch("https://n8n.bouibacademy.me/webhook/ai", { method: "POST", body: JSON.stringify(payload) });`;
    navigator.clipboard.writeText(tipText);
    setCopiedTip(true);
    toast.success("تم نسخ الكود التوضيحي إلى الحافظة!");
    setTimeout(() => setCopiedTip(false), 2000);
  };

  return (
    <section className="relative py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Background Subtle Glows */}
      <div className="absolute top-1/4 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -left-20 w-80 h-80 bg-violet/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Section */}
      <div className="mb-10 text-center md:text-right flex flex-col md:flex-row items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div>
          <div className="editorial-badge mb-2">
            <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
            <span>لوحة التعلّم الذكية • Bento Dashboard</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-foreground">
            تطوير المهارات والتطبيقات العملية
          </h2>
          <p className="mt-1 text-sm text-muted-foreground max-w-xl">
            استكشف المسارات التعليمية، اختبر السيناريوهات التفاعلية، واستفد من الأدوات التقنية المتاحة.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/lessons"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-primary hover:text-primary-glow transition-colors bg-primary/10 hover:bg-primary/20 px-4 py-2 rounded-xl border border-primary/20"
          >
            <span>جميع المسارات والدروس</span>
            {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </Link>
        </div>
      </div>

      {/* Grid Layout (Bento Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* CARD 1: Featured Track Showcase & Simulator (Span 8 cols) */}
        <div className="md:col-span-8 bento-card bento-card-hover p-6 flex flex-col justify-between bg-gradient-to-br from-card via-card to-primary/5">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <Badge className="bg-primary/15 text-primary hover:bg-primary/25 border-primary/30 px-3 py-1 font-semibold">
                {currentTrack.badge}
              </Badge>
              <div className="flex items-center gap-1.5 bg-background/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-mono text-muted-foreground border border-border/60">
                <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                <span>{currentTrack.metric}</span>
              </div>
            </div>

            {/* Track Selector Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              {(["n8n", "ai_agents", "web_dev"] as const).map((key) => (
                <button
                  key={key}
                  onClick={() => setActiveTrack(key)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    activeTrack === key
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-105"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {key === "n8n" ? "الأتمتة و n8n" : key === "ai_agents" ? "AI Agents" : "تطوير الويب"}
                </button>
              ))}
            </div>

            <h3 className="text-xl sm:text-2xl font-bold font-display text-foreground mb-2">
              {currentTrack.title}
            </h3>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              {currentTrack.description}
            </p>

            {/* Workflow Simulator Card */}
            <div className="bg-background/90 rounded-2xl p-4 border border-border/80 shadow-inner mb-6">
              <div className="flex items-center justify-between mb-3 text-xs font-mono text-muted-foreground border-b border-border/40 pb-2">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-foreground">محاكي تنفيذ السيناريو التلقائي</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSimulate}
                  disabled={isSimulating}
                  className="h-7 text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
                >
                  <Play className={`w-3 h-3 ${isSimulating ? "animate-spin" : ""}`} />
                  <span>{isSimulating ? "جاري المحاكاة..." : "تشغيل الاختبار"}</span>
                </Button>
              </div>

              {/* Steps Progress */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {currentTrack.steps.map((step, idx) => {
                  const isDone = idx <= stepIndex;
                  return (
                    <div
                      key={step.id}
                      className={`p-3 rounded-xl border text-xs transition-all ${
                        isDone
                          ? "bg-primary/10 border-primary/40 text-foreground"
                          : "bg-muted/40 border-border/40 text-muted-foreground opacity-60"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1 font-semibold">
                        <span>الخطوة {step.id}</span>
                        {isDone ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-muted-foreground/40" />
                        )}
                      </div>
                      <div className="font-mono font-medium text-primary text-[11px]">{step.name}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{step.detail}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border/40">
            <div className="flex flex-wrap gap-1.5">
              {currentTrack.tags.map((t) => (
                <span
                  key={t}
                  className="px-2.5 py-0.5 text-[11px] font-mono rounded-md bg-muted/80 text-muted-foreground border border-border/50"
                >
                  #{t}
                </span>
              ))}
            </div>
            <Link
              to={currentTrack.link}
              className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline"
            >
              <span>بدء التعلم في هذا المسار</span>
              {isRtl ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
            </Link>
          </div>
        </div>

        {/* CARD 2: Quick AI Prompt Sandbox (Span 4 cols) */}
        <div className="md:col-span-4 bento-card bento-card-hover p-6 flex flex-col justify-between bg-gradient-to-br from-card via-card to-violet/5">
          <div>
            <div className="flex items-center justify-between mb-3">
              <Badge variant="outline" className="border-violet/40 text-violet bg-violet/10 gap-1">
                <Sparkles className="w-3 h-3 text-violet animate-pulse" />
                <span>تجربة حية مصغرة</span>
              </Badge>
              <span className="text-[11px] font-mono text-muted-foreground">Sandbox v1.0</span>
            </div>

            <h3 className="text-lg font-bold font-display text-foreground mb-1">
              صندوق تجربة الـ Prompts
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              اكتب فكرة أو موضوعاً واختبر كيف يحوله الذكاء الاصطناعي إلى هيكل عملي.
            </p>

            {/* Input Box */}
            <div className="space-y-3 mb-4">
              <textarea
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="مثال: أتمتة إرسال التقرير الأسبوعي من Google Sheets إلى Slack..."
                rows={3}
                className="w-full text-xs p-3 rounded-xl border border-border/80 bg-background/80 focus:outline-none focus:ring-2 focus:ring-violet/50 resize-none font-sans"
              />
              <Button
                onClick={handleTestPrompt}
                disabled={isGenerating}
                className="w-full h-9 text-xs bg-violet hover:bg-violet/90 text-white font-medium gap-1.5 shadow-md shadow-violet/20"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isGenerating ? "جاري توليد النتيجة..." : "اختبار الفكرة فورياً"}</span>
              </Button>
            </div>

            {/* Result Display */}
            {sandboxResult && (
              <div className="p-3 rounded-xl bg-violet/10 border border-violet/30 text-xs font-mono text-foreground space-y-1 animate-fade-up">
                <p className="whitespace-pre-line leading-relaxed text-[11px]">{sandboxResult}</p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-border/40 text-[11px] text-muted-foreground flex items-center justify-between">
            <span>يدعم نماذج DeepSeek & GPT-4o</span>
            <Link to="/tools" className="text-violet font-semibold hover:underline">
              استكشف باقي الأدوات ←
            </Link>
          </div>
        </div>

        {/* CARD 3: Quick Tools Grid (Span 7 cols) */}
        <div className="md:col-span-7 bento-card bento-card-hover p-6 bg-gradient-to-br from-card via-card to-amber/5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold font-display text-foreground">
                أدوات الأكاديمية التفاعلية المجانية
              </h3>
              <p className="text-xs text-muted-foreground">أدوات ذكية مصممة لتسريع إنتاجك اليومي</p>
            </div>
            <Link
              to="/tools"
              className="text-xs font-semibold text-amber hover:text-amber/80 transition-colors"
            >
              عرض الكل
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { title: "توليد الصور", icon: ImageIcon, href: "/tools/image", color: "text-amber" },
              { title: "مستشار المسار", icon: Compass, href: "/tools/roadmap", color: "text-primary" },
              { title: "مساعد الكود", icon: Code2, href: "/tools/code", color: "text-violet" },
              { title: "المترجم التقني", icon: Languages, href: "/tools/translate", color: "text-emerald-500" },
            ].map((tool) => (
              <Link
                key={tool.title}
                to={tool.href}
                className="group p-3 rounded-xl border border-border/60 bg-background/60 hover:bg-background hover:border-primary/40 transition-all flex flex-col items-center text-center gap-2"
              >
                <div className={`p-2 rounded-lg bg-muted group-hover:scale-110 transition-transform ${tool.color}`}>
                  <tool.icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">
                  {tool.title}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* CARD 4: Daily AI Knowledge Code Tip (Span 5 cols) */}
        <div className="md:col-span-5 bento-card bento-card-hover p-6 flex flex-col justify-between bg-gradient-to-br from-card via-card to-emerald-500/5">
          <div>
            <div className="flex items-center justify-between mb-3">
              <Badge variant="outline" className="border-emerald-500/40 text-emerald-600 bg-emerald-500/10 text-[11px]">
                كود / نصيحة اليوم التقنية
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyTip}
                className="h-7 text-[11px] gap-1 text-muted-foreground hover:text-foreground"
              >
                {copiedTip ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copiedTip ? "تم النسخ" : "نسخ الكود"}</span>
              </Button>
            </div>

            <div className="bg-muted/80 rounded-xl p-3 font-mono text-[11px] text-foreground border border-border/60 overflow-x-auto">
              <p className="text-emerald-600 dark:text-emerald-400 font-semibold mb-1">// n8n Auto AI Trigger Snippet</p>
              <p className="text-muted-foreground">const payload = &#123; topic: "AI", model: "deepseek-r1" &#125;;</p>
              <p className="text-muted-foreground">await fetch("https://n8n.domain/webhook/ai", &#123; body &#125;);</p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-emerald-500" />
              <span>محدث يومياً لمجتمع الأكاديمية</span>
            </span>
            <Link to="/posts" className="font-semibold text-emerald-600 hover:underline">
              مزيد من الشروحات ←
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
