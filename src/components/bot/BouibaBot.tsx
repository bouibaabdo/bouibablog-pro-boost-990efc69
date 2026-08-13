import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Bot, X, Send, Sparkles, MessageSquare } from "lucide-react";

// ─── Page-Contextual Quips (shown as floating speech bubbles) ─────────────────
const PAGE_QUIPS: Record<string, string[]> = {
  "/": [
    "🏠 أهلاً بك في الصفحة الرئيسية! استكشف معي المحتوى 🚀",
    "✨ لدينا مقالات وتقنيات جديدة في الأتمتة وAI!",
    "🤖 أنا بويبو! خبير الذكاء الاصطناعي في خدمتك",
    "💡 هل جربت أدواتنا الذكية المجانية؟",
  ],
  "/posts": [
    "📚 أهلاً بك في قسم المقالات التقنية!",
    "🔥 أحدث شروحات n8n وOllama والذكاء الاصطناعي المحلي!",
    "📖 اقرأ واستمتع — المعرفة قوة 💪",
    "🎯 هل تبحث عن موضوع معين؟ اسألني!",
  ],
  "/tools": [
    "🛠️ مرحباً بك في قسم الأدوات التفاعلية!",
    "🖼️ جرّب مولد الصور والمترجم التقني الآن!",
    "⚡ كل هذه الأدوات مجانية 100%!",
  ],
  "/about": [
    "👋 تعرّف على فريق Bouiba Academy!",
    "💚 مهمتنا: جعل الذكاء الاصطناعي في متناول الجميع باللغة العربية",
  ],
  "/contact": ["📩 يسعدنا تواصلك معنا لأي استفسار أو اقتراح!"],
};

const IDLE_QUIPS = [
  "🤔 هل تحتاج مساعدة؟",
  "⚡ اسألني أي شيء!",
  "🎁 عندي معلومات تقنية تهمك!",
  "مرحباً بك! لا تتردد في السوال 🤖",
];

// ─── Knowledge Base ───────────────────────────────────────────────────────────
interface KnowledgeItem {
  keywords: string[];
  answer: string;
  link?: { to: string; label: string };
}

const KNOWLEDGE_BASE: KnowledgeItem[] = [
  {
    keywords: ["مقالات", "آخر", "مقال", "اقرأ", "محتوى", "articles"],
    answer:
      "📚 **آخر ما نشرناه:**\n• دليل تشغيل DeepSeek-R1 محلياً مع n8n\n• أفضل أدوات الأمن السيبراني مفتوحة المصدر\n• أتمتة النشر على فيسبوك وتيليجرام\n• تحسين أداء وحماية المواقع",
    link: { to: "/posts", label: "📚 جميع المقالات →" },
  },
  {
    keywords: ["أدوات", "ذكاء", "اصطناعي", "tools", "ai", "tool"],
    answer:
      "🛠️ **أدواتنا الذكية المجانية:**\n• 🖼️ توليد الصور بالذكاء الاصطناعي\n• 🔍 مساعد البرمجة وتصحيح الأكواد\n• 📝 ملخص النصوص والوثائق\n• 🗺️ خريطة طريق التعلم\n• 🌍 المترجم التقني الاحترافي",
    link: { to: "/tools", label: "🛠️ استكشف الأدوات →" },
  },
  {
    keywords: ["n8n", "أتمتة", "automation", "workflow"],
    answer:
      "⚡ **n8n والأتمتة:**\nدليل شامل لأتمتة مهامك اليومية:\n• ربط التطبيقات بدون كود\n• أتمتة النشر على السوشيال ميديا\n• بناء وكلاء AI محليين",
    link: { to: "/posts", label: "⚡ مقالات n8n →" },
  },
  {
    keywords: ["ollama", "نماذج", "محلي", "local", "llm", "deepseek"],
    answer:
      "🤖 **تشغيل AI محلياً:**\nشروحات لتشغيل:\n• Ollama مع نماذج Llama, Mistral, DeepSeek\n• ربط النماذج المحلية مع n8n\n• حماية بياناتك 100% مجاناً",
    link: { to: "/posts", label: "🤖 اقرأ المقالات →" },
  },
  {
    keywords: ["عن", "من", "أكاديمية", "بويبة", "about", "bouiba"],
    answer:
      "🌟 **Bouiba Academy:**\nأكاديمية تقنية عربية متخصصة في الذكاء الاصطناعي، الأتمتة، وأدوات المطورين.",
    link: { to: "/about", label: "🌟 تعرف علينا →" },
  },
  {
    keywords: ["تواصل", "contact", "اتصال", "رسالة", "بريد"],
    answer: "📩 **تواصل معنا:**\nراسلنا لأي سؤال أو اقتراح! نحن يسعدنا دائماً سماع رأيك 💚",
    link: { to: "/contact", label: "📩 تواصل الآن →" },
  },
];

function findAnswer(input: string): KnowledgeItem | null {
  const lower = input.trim().toLowerCase();
  for (const item of KNOWLEDGE_BASE) {
    if (item.keywords.some((kw) => lower.includes(kw.toLowerCase()))) return item;
  }
  return null;
}

// ─── Robot Canvas Renderer (Pure Idle Floating Animation) ────────────────────
function drawRobot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  talking: boolean,
  blinking: boolean,
  wiggle: number,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.rotate(Math.sin(wiggle) * 0.05);

  const s = 1.1;
  const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");

  // 1. Futuristic thruster glow
  const glowY = 18 * s;
  const glowRadius = talking ? (16 + Math.sin(wiggle * 5) * 3) * s : 14 * s;
  const engineGlow = ctx.createRadialGradient(0, glowY, 1, 0, glowY, glowRadius);
  engineGlow.addColorStop(0, isDark ? "rgba(13, 110, 110, 0.6)" : "rgba(13, 148, 136, 0.5)");
  engineGlow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = engineGlow;
  ctx.beginPath();
  ctx.arc(0, glowY, glowRadius, 0, Math.PI * 2);
  ctx.fill();

  // 2. Main spherical body shell
  const bodyG = ctx.createLinearGradient(-26 * s, -26 * s, 26 * s, 26 * s);
  bodyG.addColorStop(0, isDark ? "#1E293B" : "#FFFFFF");
  bodyG.addColorStop(1, isDark ? "#0F172A" : "#F1F5F9");
  ctx.fillStyle = bodyG;
  ctx.strokeStyle = isDark ? "#14B8A6" : "#0D6E6E";
  ctx.lineWidth = 2.5;
  ctx.shadowColor = isDark ? "#14B8A6" : "#0D6E6E";
  ctx.shadowBlur = talking ? 10 : 4;
  ctx.beginPath();
  ctx.arc(0, -10 * s, 26 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;

  // 3. Floating side pod wings
  const wingOffset = Math.sin(wiggle * 3) * 2;
  ctx.fillStyle = isDark ? "#334155" : "#E2E8F0";
  ctx.strokeStyle = isDark ? "#22D3EE" : "#0D6E6E";
  ctx.lineWidth = 2;

  // Left wing
  ctx.save();
  ctx.translate(-34 * s - wingOffset, -10 * s);
  ctx.beginPath();
  ctx.ellipse(0, 0, 4.5 * s, 11 * s, -0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Right wing
  ctx.save();
  ctx.translate(34 * s + wingOffset, -10 * s);
  ctx.beginPath();
  ctx.ellipse(0, 0, 4.5 * s, 11 * s, 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // 4. Glowing signal ring floating above head
  ctx.save();
  ctx.translate(0, -42 * s + Math.sin(wiggle * 2) * 2);
  ctx.strokeStyle = isDark ? "rgba(34, 211, 238, 0.8)" : "rgba(13, 110, 110, 0.7)";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.ellipse(0, 0, 16 * s, 4.5 * s, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // 5. Visor screen
  ctx.fillStyle = "#090D16";
  ctx.beginPath();
  ctx.ellipse(0, -10 * s, 19 * s, 13 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = isDark ? "rgba(34, 211, 238, 0.4)" : "rgba(13, 110, 110, 0.4)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // 6. Glowing cyber eyes
  const eyeColor = blinking ? "#090D16" : talking ? "#00F2FE" : "#14B8A6";
  ctx.fillStyle = eyeColor;
  ctx.shadowColor = eyeColor;
  ctx.shadowBlur = blinking ? 0 : 10;

  if (blinking) {
    ctx.strokeStyle = isDark ? "#22D3EE" : "#0D6E6E";
    ctx.lineWidth = 2.5 * s;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-11 * s, -10 * s);
    ctx.lineTo(-5 * s, -10 * s);
    ctx.moveTo(5 * s, -10 * s);
    ctx.lineTo(11 * s, -10 * s);
    ctx.stroke();
  } else if (talking) {
    ctx.strokeStyle = "#00F2FE";
    ctx.lineWidth = 3 * s;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(-8 * s, -8 * s, 4 * s, Math.PI, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(8 * s, -8 * s, 4 * s, Math.PI, 0);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.arc(-8 * s, -10 * s, 4 * s, 0, Math.PI * 2);
    ctx.arc(8 * s, -10 * s, 4 * s, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
    ctx.beginPath();
    ctx.arc(-9.5 * s, -11.5 * s, 1.2 * s, 0, Math.PI * 2);
    ctx.arc(6.5 * s, -11.5 * s, 1.2 * s, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.shadowBlur = 0;

  ctx.restore();
}

// ─── Chat Panel Messages ──────────────────────────────────────────────────────
interface Message {
  id: string;
  from: "bot" | "user";
  text: string;
  link?: { to: string; label: string };
}

function BotText({ text }: { text: string }) {
  return (
    <div className="space-y-1">
      {text.split("\n").map((line, i) => {
        if (line.startsWith("**") && line.endsWith("**"))
          return (
            <p key={i} className="font-bold text-primary">
              {line.slice(2, -2)}
            </p>
          );
        if (line.startsWith("• "))
          return (
            <p key={i} className="flex gap-1.5">
              <span className="shrink-0 text-primary">•</span>
              <span>{line.slice(2)}</span>
            </p>
          );
        return (
          <p key={i} className={line === "" ? "h-1.5" : ""}>
            {line}
          </p>
        );
      })}
    </div>
  );
}

const QUICK_ACTIONS = [
  { id: "articles", label: "📚 آخر المقالات" },
  { id: "tools", label: "🛠️ أدوات AI" },
  { id: "about", label: "🌟 عن الأكاديمية" },
  { id: "contact", label: "📩 تواصل معنا" },
];

// ─── Main Bot Component ──────────────────────────────────────────────────────
export function BouibaBot() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Canvas Ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // States
  const [bubble, setBubble] = useState("");
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTalking, setIsTalking] = useState(false);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const wiggleRef = useRef(0);
  const blinkTimerRef = useRef(0);
  const blinkRef = useRef(false);
  const quipTimerRef = useRef(0);
  const frameRef = useRef(0);

  // Show floating speech bubble without sound
  const showBubble = useCallback((text: string, durationMs = 3200) => {
    setBubble(text);
    setBubbleVisible(true);
    setIsTalking(true);
    setTimeout(() => {
      setBubbleVisible(false);
      setIsTalking(false);
    }, durationMs);
  }, []);

  // Route-change quip
  useEffect(() => {
    const quips = PAGE_QUIPS[pathname] ?? PAGE_QUIPS["/"];
    const q = quips[Math.floor(Math.random() * quips.length)];
    const timer = setTimeout(() => showBubble(q, 3500), 1500);
    return () => clearTimeout(timer);
  }, [pathname, showBubble]);

  // Floating canvas render loop (In-place bobbing, no mouse interaction)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let lastTime = performance.now();

    const render = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      wiggleRef.current += dt * 2.5;

      // Blink logic
      blinkTimerRef.current += dt;
      if (blinkTimerRef.current > 4.0 + Math.random() * 2) {
        blinkRef.current = true;
        blinkTimerRef.current = 0;
        setTimeout(() => {
          blinkRef.current = false;
        }, 140);
      }

      // Quip timer
      quipTimerRef.current += dt;
      if (quipTimerRef.current > 15 + Math.random() * 10) {
        quipTimerRef.current = 0;
        if (!bubbleVisible && !chatOpen) {
          const q = IDLE_QUIPS[Math.floor(Math.random() * IDLE_QUIPS.length)];
          showBubble(q, 3000);
        }
      }

      // Render robot floating at canvas center (60x60 canvas)
      ctx.clearRect(0, 0, 80, 80);
      const bobbingY = 40 + Math.sin(wiggleRef.current) * 3;

      drawRobot(
        ctx,
        40,
        bobbingY,
        0.55, // scale
        isTalking,
        blinkRef.current,
        wiggleRef.current,
      );

      frameRef.current = requestAnimationFrame(render);
    };

    frameRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frameRef.current);
    };
  }, [chatOpen, bubbleVisible, isTalking, showBubble]);

  // Auto-scroll chat
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  // Chat message helper
  const addBotMessage = useCallback((text: string, link?: { to: string; label: string }) => {
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), from: "bot", text, link }]);
    setIsTalking(true);
    const dur = Math.max(1500, text.length * 30);
    setTimeout(() => {
      setIsTalking(false);
    }, dur);
  }, []);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), from: "user", text: trimmed }]);
    setInput("");
    setTimeout(() => {
      const found = findAnswer(trimmed);
      if (found) {
        addBotMessage(found.answer, found.link);
      } else {
        addBotMessage(
          "عذراً، لم أفهم استفسارك بشكل كامل 😅\nيمكنك السؤال عن المقالات، أدوات الذكاء الاصطناعي، n8n، ودروس الأتمتة.",
        );
      }
    }, 400);
  }, [input, addBotMessage]);

  const handleQuick = useCallback(
    (id: string) => {
      const a = QUICK_ACTIONS.find((x) => x.id === id);
      if (!a) return;
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), from: "user", text: a.label }]);
      setTimeout(() => {
        const found = findAnswer(a.label);
        if (found) addBotMessage(found.answer, found.link);
      }, 350);
    },
    [addBotMessage],
  );

  return (
    <>
      {/* ── Fixed Floating Robot Widget Button (Bottom Left Corner) ── */}
      <div className="fixed bottom-5 left-5 z-[9998] flex items-center gap-3">
        {/* Floating Speech Bubble */}
        {bubbleVisible && !chatOpen && (
          <div className="animate-fade-up max-w-[220px] rounded-2xl rounded-bl-none border border-primary/30 bg-card/95 backdrop-blur-md px-3.5 py-2 text-center text-xs font-medium text-foreground shadow-xl">
            {bubble}
          </div>
        )}

        {/* Robot Trigger Container */}
        <button
          onClick={() => {
            setChatOpen(!chatOpen);
            if (!chatOpen && messages.length === 0) {
              addBotMessage(
                "أهلاً وسهلاً! 🤖✨ أنا بويبو، مساعدك التقني الذكي في Bouiba Academy!\nكيف يمكنني مساعدتك اليوم؟",
              );
            }
          }}
          className="group relative flex items-center justify-center rounded-2xl border border-primary/30 bg-card/90 backdrop-blur-md p-1.5 shadow-elegant hover:scale-105 hover:border-primary transition-all duration-300 cursor-pointer"
          aria-label="مساعد بويبو الذكي"
        >
          {/* Active status pulse dot */}
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
          </span>

          <canvas ref={canvasRef} width={80} height={80} className="w-14 h-14" />
        </button>
      </div>

      {/* ── Responsive Floating Chat Drawer ── */}
      {chatOpen && (
        <div
          className="fixed bottom-22 left-4 md:left-6 z-[9999] flex w-[calc(100vw-2rem)] sm:w-[340px] max-h-[460px] flex-col overflow-hidden rounded-2xl border border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl animate-scale-in"
          dir="rtl"
        >
          {/* Header */}
          <div className="flex items-center justify-between bg-primary/10 border-b border-border/60 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold shadow-sm">
                🤖
              </div>
              <div>
                <h4 className="font-bold text-xs text-foreground font-display">بويبو المساعد الذكي</h4>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>متصل ومستعد للمساعدة</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => setChatOpen(false)}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              aria-label="إغلاق المحادثة"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 space-y-3 overflow-y-auto p-3.5 bg-background/50 text-xs"
            style={{ minHeight: 180, maxHeight: 260 }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-end gap-2 ${msg.from === "user" ? "justify-start" : "justify-end"}`}
              >
                {msg.from === "bot" && <span className="shrink-0 text-sm mb-0.5">🤖</span>}
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed ${
                    msg.from === "user"
                      ? "rounded-br-none bg-primary text-primary-foreground shadow-sm"
                      : "rounded-bl-none border border-border/70 bg-surface text-foreground shadow-sm"
                  }`}
                >
                  {msg.from === "bot" ? (
                    <>
                      <BotText text={msg.text} />
                      {msg.link && (
                        <Link
                          to={msg.link.to as any}
                          className="mt-2.5 inline-flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
                          onClick={() => setChatOpen(false)}
                        >
                          {msg.link.label}
                        </Link>
                      )}
                    </>
                  ) : (
                    <p>{msg.text}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          {messages.length <= 1 && (
            <div className="flex flex-wrap gap-1.5 border-t border-border/50 bg-muted/40 px-3 py-2">
              {QUICK_ACTIONS.map((a) => (
                <button
                  key={a.id}
                  onClick={() => handleQuick(a.id)}
                  className="rounded-xl border border-primary/20 bg-background/80 px-2.5 py-1 text-[11px] font-medium text-primary hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer"
                >
                  {a.label}
                </button>
              ))}
            </div>
          )}

          {/* Input Bar */}
          <div className="flex items-center gap-2 border-t border-border/60 bg-card p-2.5">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="اسأل بويبو أي شيء..."
              className="flex-1 rounded-xl border border-border/80 bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 font-sans"
              dir="rtl"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="rounded-xl bg-primary p-2 text-primary-foreground transition-all hover:opacity-90 disabled:opacity-40 cursor-pointer shadow-sm"
              aria-label="إرسال"
            >
              <Send className="h-3.5 w-3.5 rotate-180" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
