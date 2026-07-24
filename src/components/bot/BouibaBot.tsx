import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "@tanstack/react-router";

// ─── Bot Messages & Knowledge ───────────────────────────────────────────────
const WELCOME_MESSAGES = [
  "مرحباً بك في Bouiba Academy 👋 أنا بويبو، مساعدك الذكي! كيف أساعدك اليوم؟",
];

const QUICK_ACTIONS = [
  { id: "articles", label: "📚 آخر المقالات", icon: "📚" },
  { id: "tools", label: "🛠️ أدوات الذكاء الاصطناعي", icon: "🛠️" },
  { id: "topics", label: "🏷️ تصفح المواضيع", icon: "🏷️" },
  { id: "about", label: "ℹ️ عن الأكاديمية", icon: "ℹ️" },
];

interface KnowledgeItem {
  keywords: string[];
  answer: string;
  link?: { to: string; label: string };
}

const KNOWLEDGE_BASE: KnowledgeItem[] = [
  {
    keywords: ["مقالات", "آخر", "مقال", "اقرأ", "محتوى", "articles"],
    answer:
      "📚 **آخر ما نشرناه:**\n• دليل تشغيل DeepSeek-R1 محلياً مع n8n\n• أفضل أدوات الأمن السيبراني مفتوحة المصدر\n• أتمتة النشر على فيسبوك وتيليجرام\n• تحسين PageSpeed إلى 100/100\n• خوادم سحابية مجانية للمطورين\n\nانقر لتصفح جميع المقالات 👇",
    link: { to: "/posts", label: "جميع المقالات →" },
  },
  {
    keywords: ["أدوات", "ذكاء", "اصطناعي", "tools", "ai", "tool"],
    answer:
      "🛠️ **أدواتنا الذكية المجانية:**\n• 🖼️ توليد الصور بالذكاء الاصطناعي\n• 🔍 مساعد SEO\n• 📝 ملخص النصوص الذكي\n• 💡 مولد أفكار المحتوى\n• 🗺️ خريطة طريق التعلم\n• 🌍 مترجم ذكي\n• 🏗️ مهندس الـ Prompts\n\nجرّب كل الأدوات مجاناً! 🚀",
    link: { to: "/tools", label: "استكشف الأدوات →" },
  },
  {
    keywords: ["n8n", "أتمتة", "automation", "workflow"],
    answer:
      "⚡ **n8n والأتمتة:**\nلدينا دليل شامل لأتمتة المهام اليومية باستخدام n8n:\n• ربط التطبيقات بدون كود\n• أتمتة النشر على السوشيال ميديا\n• بناء وكلاء AI محليين\n• تكامل مع Supabase, Google Sheets وأكثر",
    link: { to: "/posts", label: "مقالات n8n →" },
  },
  {
    keywords: ["ollama", "نماذج", "محلي", "local", "llm"],
    answer:
      "🤖 **تشغيل الذكاء الاصطناعي محلياً:**\nنقدم شروحات تفصيلية لتشغيل:\n• Ollama مع نماذج Llama, Mistral, DeepSeek\n• ربط النماذج المحلية مع n8n\n• حماية بياناتك وخصوصيتك 100%\n• مجاناً بالكامل على جهازك!",
    link: { to: "/posts", label: "اقرأ المقالات →" },
  },
  {
    keywords: ["seo", "سيو", "بحث", "google", "جوجل"],
    answer:
      "🔍 **تحسين محركات البحث (SEO):**\nندرّس أسرار الظهور في جوجل:\n• تقنيات Core Web Vitals\n• تحسين سرعة الموقع بـ Cloudflare\n• الكلمات المفتاحية والمحتوى العربي\n• Schema Markup وهيكل البيانات",
    link: { to: "/posts", label: "دروس SEO →" },
  },
  {
    keywords: ["أمن", "امن", "سيبراني", "اختراق", "هاكر", "cybersecurity", "hack"],
    answer:
      "🔐 **الأمن السيبراني:**\nنشرنا دليلاً شاملاً لأفضل أدوات:\n• فحص الثغرات الأمنية\n• اختبار الاختراق الأخلاقي\n• حماية المواقع والسيرفرات\n• أدوات مفتوحة المصدر 100%",
    link: { to: "/posts", label: "مقالات الأمن →" },
  },
  {
    keywords: ["عن", "من", "أكاديمية", "بويبة", "about", "bouiba"],
    answer:
      "🌟 **Bouiba Academy:**\nأكاديمية عربية متخصصة في:\n• الذكاء الاصطناعي والأتمتة\n• شروحات تقنية عملية بالعربية\n• أدوات مجانية للمطورين\n• محتوى حصري ومراجعات صادقة\n\nهدفنا: جعل التكنولوجيا في متناول الجميع 💪",
    link: { to: "/about", label: "تعرف علينا →" },
  },
  {
    keywords: ["تواصل", "contact", "اتصال", "رسالة"],
    answer:
      "📩 **تواصل معنا:**\nيسعدنا التواصل معك!\n• راسلنا عبر صفحة التواصل\n• تابعنا على فيسبوك\n• اشترك في النشرة الأسبوعية للبقاء على اطلاع",
    link: { to: "/contact", label: "صفحة التواصل →" },
  },
];

// Fuzzy keyword matcher
function findAnswer(input: string): KnowledgeItem | null {
  const lower = input.trim().toLowerCase();
  for (const item of KNOWLEDGE_BASE) {
    if (item.keywords.some((kw) => lower.includes(kw.toLowerCase()))) {
      return item;
    }
  }
  return null;
}

// Web Speech API TTS wrapper
function speak(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ar-SA";
  utterance.rate = 0.92;
  utterance.pitch = 1.05;
  utterance.volume = 0.88;

  // Try to find an Arabic voice
  const voices = window.speechSynthesis.getVoices();
  const arVoice = voices.find(
    (v) =>
      v.lang.startsWith("ar") ||
      v.name.toLowerCase().includes("arabic") ||
      v.name.toLowerCase().includes("arab"),
  );
  if (arVoice) utterance.voice = arVoice;

  window.speechSynthesis.speak(utterance);
}

// ─── Typing Animation ────────────────────────────────────────────────────────
function useTypingText(text: string, speed = 25, trigger = true) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!trigger) return;
    setDisplayed("");
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed, trigger]);

  return { displayed, done };
}

// ─── Message Types ────────────────────────────────────────────────────────────
interface Message {
  id: string;
  from: "bot" | "user";
  text: string;
  link?: { to: string; label: string };
  ts: number;
}

// ─── Animated Robot SVG ─────────────────────────────────────────────────────
function RobotAvatar({ talking, size = 48 }: { talking?: boolean; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Antenna */}
      <line x1="40" y1="6" x2="40" y2="14" stroke="#0D6E6E" strokeWidth="2.5" strokeLinecap="round" />
      <circle
        cx="40"
        cy="5"
        r="3.5"
        fill={talking ? "#10B981" : "#0D6E6E"}
        style={{ transition: "fill 0.3s" }}
      >
        {talking && (
          <animate attributeName="opacity" values="1;0.3;1" dur="0.6s" repeatCount="indefinite" />
        )}
      </circle>

      {/* Head */}
      <rect x="18" y="14" width="44" height="36" rx="10" fill="#1E293B" />
      <rect x="20" y="16" width="40" height="32" rx="8" fill="#0F172A" />

      {/* Eyes — Glowing LED */}
      <rect x="26" y="24" width="10" height="7" rx="3" fill={talking ? "#10B981" : "#06B6D4"}>
        {talking && (
          <animate attributeName="fill" values="#10B981;#22D3EE;#10B981" dur="0.4s" repeatCount="indefinite" />
        )}
      </rect>
      <rect x="44" y="24" width="10" height="7" rx="3" fill={talking ? "#10B981" : "#06B6D4"}>
        {talking && (
          <animate attributeName="fill" values="#10B981;#22D3EE;#10B981" dur="0.4s" repeatCount="indefinite" />
        )}
      </rect>

      {/* Mouth / Speaker grill */}
      <rect x="27" y="36" width="26" height="4" rx="2" fill="#334155" />
      {talking && (
        <>
          <rect x="30" y="37.2" width="4" height="1.6" rx="1" fill="#10B981">
            <animate attributeName="height" values="1.6;3.5;1.6" dur="0.3s" repeatCount="indefinite" />
            <animate attributeName="y" values="37.2;36.4;37.2" dur="0.3s" repeatCount="indefinite" />
          </rect>
          <rect x="36" y="37.2" width="4" height="1.6" rx="1" fill="#22D3EE">
            <animate attributeName="height" values="1.6;2.8;1.6" dur="0.25s" repeatCount="indefinite" />
            <animate attributeName="y" values="37.2;36.8;37.2" dur="0.25s" repeatCount="indefinite" />
          </rect>
          <rect x="42" y="37.2" width="4" height="1.6" rx="1" fill="#10B981">
            <animate attributeName="height" values="1.6;3.5;1.6" dur="0.35s" repeatCount="indefinite" />
            <animate attributeName="y" values="37.2;36.4;37.2" dur="0.35s" repeatCount="indefinite" />
          </rect>
          <rect x="48" y="37.2" width="4" height="1.6" rx="1" fill="#06B6D4">
            <animate attributeName="height" values="1.6;2.5;1.6" dur="0.28s" repeatCount="indefinite" />
            <animate attributeName="y" values="37.2;37;37.2" dur="0.28s" repeatCount="indefinite" />
          </rect>
        </>
      )}

      {/* Body */}
      <rect x="24" y="52" width="32" height="22" rx="8" fill="#1E293B" />
      <rect x="26" y="54" width="28" height="18" rx="6" fill="#0F172A" />

      {/* Chest Badge */}
      <rect x="30" y="58" width="20" height="10" rx="3" fill="#0D6E6E" opacity="0.8" />
      <text x="40" y="65" textAnchor="middle" fontSize="5" fill="#E0F2FE" fontFamily="system-ui" fontWeight="bold">
        AI
      </text>

      {/* Arms */}
      <rect x="10" y="54" width="12" height="6" rx="3" fill="#1E293B" />
      <rect x="58" y="54" width="12" height="6" rx="3" fill="#1E293B" />
      <circle cx="9" cy="57" r="4" fill="#334155" />
      <circle cx="71" cy="57" r="4" fill="#334155" />

      {/* Legs */}
      <rect x="28" y="74" width="9" height="5" rx="2.5" fill="#1E293B" />
      <rect x="43" y="74" width="9" height="5" rx="2.5" fill="#1E293B" />
    </svg>
  );
}

// ─── Markdown-ish Text Renderer ──────────────────────────────────────────────
function BotText({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-1 leading-relaxed">
      {lines.map((line, i) => {
        if (line.startsWith("**") && line.endsWith("**")) {
          return (
            <p key={i} className="font-bold text-teal-700 dark:text-teal-300">
              {line.slice(2, -2)}
            </p>
          );
        }
        if (line.startsWith("• ")) {
          return (
            <p key={i} className="flex items-start gap-1.5">
              <span className="mt-0.5 text-teal-500 shrink-0">•</span>
              <span>{line.slice(2)}</span>
            </p>
          );
        }
        return (
          <p key={i} className={line === "" ? "h-2" : ""}>
            {line}
          </p>
        );
      })}
    </div>
  );
}

// ─── Main BouibaBot Component ─────────────────────────────────────────────────
export function BouibaBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTalking, setIsTalking] = useState(false);
  const [showPulse, setShowPulse] = useState(true);
  const [hasGreeted, setHasGreeted] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const addBotMessage = useCallback(
    (text: string, link?: { to: string; label: string }) => {
      const msg: Message = {
        id: crypto.randomUUID(),
        from: "bot",
        text,
        link,
        ts: Date.now(),
      };
      setMessages((prev) => [...prev, msg]);
      setIsTalking(true);
      speak(text.replace(/[🐝✨🛠️📚🏷️ℹ️🔐⚡🤖🌟📩🔍]/g, "").replace(/\*\*/g, ""));
      const estimated = Math.max(1200, text.length * 40);
      setTimeout(() => setIsTalking(false), estimated);
    },
    [],
  );

  // Greet on first open
  useEffect(() => {
    if (isOpen && !hasGreeted) {
      setHasGreeted(true);
      setTimeout(() => {
        addBotMessage(WELCOME_MESSAGES[0]);
      }, 400);
    }
  }, [isOpen, hasGreeted, addBotMessage]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Pulse animation on button
  useEffect(() => {
    const timer = setTimeout(() => setShowPulse(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  // Initial welcome greeting with voice after 2s
  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        const voices = window.speechSynthesis.getVoices();
        const greet = () => {
          speak("مرحباً بك في بويبة أكاديمي! يسعدني مساعدتك.");
        };
        if (voices.length > 0) {
          greet();
        } else {
          window.speechSynthesis.addEventListener("voiceschanged", greet, { once: true });
        }
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      from: "user",
      text: trimmed,
      ts: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    setTimeout(() => {
      const found = findAnswer(trimmed);
      if (found) {
        addBotMessage(found.answer, found.link);
      } else {
        addBotMessage(
          "عذراً لم أجد إجابة محددة 😅 لكن يمكنني مساعدتك في:\n• تصفح المقالات\n• اكتشاف أدوات الذكاء الاصطناعي\n• التعرف على محتوى الأكاديمية\nفقط اسألني!",
        );
      }
    }, 600);
  }, [input, addBotMessage]);

  const handleQuickAction = useCallback(
    (id: string) => {
      const action = QUICK_ACTIONS.find((a) => a.id === id);
      if (!action) return;

      const userMsg: Message = {
        id: crypto.randomUUID(),
        from: "user",
        text: action.label,
        ts: Date.now(),
      };
      setMessages((prev) => [...prev, userMsg]);

      setTimeout(() => {
        const found = findAnswer(action.label);
        if (found) {
          addBotMessage(found.answer, found.link);
        }
      }, 500);
    },
    [addBotMessage],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-5 left-5 z-[9999] flex flex-col items-start" dir="rtl">
      {/* ── Chat Panel ── */}
      <div
        className={`
          mb-3 flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl
          dark:border-slate-700 dark:bg-slate-900
          transition-all duration-500 ease-in-out
          ${isOpen
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-90 pointer-events-none h-0"}
        `}
        style={{ width: "min(360px, calc(100vw - 24px))", maxHeight: isOpen ? "520px" : "0px" }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 bg-gradient-to-l from-teal-700 to-teal-600 px-4 py-3">
          <RobotAvatar talking={isTalking} size={36} />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white text-sm leading-tight">بويبو</p>
            <p className="text-teal-200 text-xs">
              {isTalking ? "🔊 يتحدث..." : "🟢 متصل"}
            </p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-full p-1.5 text-teal-100 hover:bg-teal-800 transition-colors"
            aria-label="إغلاق"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50 dark:bg-slate-950"
          style={{ minHeight: "220px", maxHeight: "310px" }}
        >
          {messages.length === 0 && (
            <div className="text-center py-6 text-slate-400 dark:text-slate-600 text-sm">
              <RobotAvatar size={52} />
              <p className="mt-2">اسألني أي شيء عن الأكاديمية...</p>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.from === "user" ? "justify-start" : "justify-end"} items-end gap-2`}
            >
              {msg.from === "bot" && (
                <div className="shrink-0 mb-1">
                  <RobotAvatar size={24} talking={isTalking && msg.ts === messages.at(-1)?.ts} />
                </div>
              )}
              <div
                className={`
                  max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed
                  ${msg.from === "user"
                    ? "bg-teal-600 text-white rounded-br-none"
                    : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-700 rounded-bl-none shadow-sm"
                  }
                `}
              >
                {msg.from === "bot" ? (
                  <>
                    <BotText text={msg.text} />
                    {msg.link && (
                      <Link
                        to={msg.link.to as any}
                        className="mt-2 inline-flex items-center gap-1 rounded-lg bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-700 px-3 py-1.5 text-xs font-semibold text-teal-700 dark:text-teal-300 hover:bg-teal-100 transition-colors"
                        onClick={() => setIsOpen(false)}
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

        {/* Quick Actions — only show if no messages yet */}
        {messages.length <= 1 && (
          <div className="px-3 py-2 flex flex-wrap gap-1.5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.id}
                onClick={() => handleQuickAction(action.id)}
                className="rounded-full border border-teal-200 dark:border-teal-700 bg-teal-50 dark:bg-teal-900/20 px-3 py-1 text-xs font-medium text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-800/40 transition-colors"
              >
                {action.label}
              </button>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div className="flex items-center gap-2 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2.5">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="اسألني عن المحتوى..."
            className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all"
            aria-label="رسالتك"
            dir="rtl"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="rounded-xl bg-teal-600 p-2 text-white hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
            aria-label="إرسال"
          >
            <svg className="h-4 w-4 rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M22 2 11 13M22 2 15 22 11 13 2 9l20-7z" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── FAB Button ── */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`
          relative flex items-center gap-2.5 rounded-2xl shadow-2xl
          transition-all duration-300 active:scale-95
          ${isOpen
            ? "bg-slate-700 dark:bg-slate-800 px-3.5 py-2.5"
            : "bg-gradient-to-br from-teal-600 to-teal-800 px-4 py-3 hover:from-teal-500 hover:to-teal-700"}
        `}
        aria-label={isOpen ? "إغلاق بويبو" : "فتح المساعد الذكي"}
      >
        {/* Pulse rings */}
        {showPulse && !isOpen && (
          <>
            <span className="absolute inset-0 rounded-2xl bg-teal-400 animate-ping opacity-30" />
            <span className="absolute inset-0 rounded-2xl bg-teal-500 animate-pulse opacity-20" />
          </>
        )}

        <RobotAvatar talking={isTalking && !isOpen} size={32} />

        {!isOpen && (
          <span className="text-white text-xs font-bold whitespace-nowrap">
            بويبو 🤖
          </span>
        )}

        {/* Talking Indicator on FAB */}
        {isTalking && !isOpen && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-500 border-2 border-white">
            <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
          </span>
        )}
      </button>
    </div>
  );
}
