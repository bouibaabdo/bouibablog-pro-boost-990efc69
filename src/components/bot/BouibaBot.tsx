import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useRouterState } from "@tanstack/react-router";

// ─── Page-Contextual Quips (shown as floating speech bubbles) ─────────────────
const PAGE_QUIPS: Record<string, string[]> = {
  "/": [
    "🏠 أهلاً بك في الصفحة الرئيسية! استكشف معي المحتوى 🚀",
    "✨ عندنا مقالات تقنية رائعة — ألا تريد تصفحها؟",
    "🤖 أنا بويبو! خبير الذكاء الاصطناعي في خدمتك 24/7",
    "💡 هل جربت أدواتنا الذكية المجانية؟ ستغير حياتك!",
  ],
  "/posts": [
    "📚 ممتاز! أنت في قسم المقالات التقنية!",
    "🔥 أحدث مقالاتنا عن n8n وOllama وAI محلي!",
    "📖 اقرأ واستمتع — المعرفة قوة 💪",
    "🎯 هل تبحث عن موضوع معين؟ اسألني!",
  ],
  "/tools": [
    "🛠️ وووو! أدوات الذكاء الاصطناعي المجانية هنا!",
    "🖼️ جرّب مولد الصور — سيبهرك النتيجة!",
    "⚡ كل هذه الأدوات مجانية 100% يا صديقي!",
    "🤩 مساعد SEO + المترجم + الملخّص... كلها هنا!",
  ],
  "/about": [
    "👋 تعرّف على فريق Bouiba Academy!",
    "💚 نحن نؤمن أن التكنولوجيا يجب أن تكون بالعربية",
    "🌟 مهمتنا: جعل AI في متناول الجميع!",
  ],
  "/contact": ["📩 يسعدنا سماعك! راسلنا بلا تردد", "💬 لديك سؤال أو اقتراح؟ تواصل معنا الآن!"],
};

const IDLE_QUIPS = [
  "psst... 👀 كليك علي!",
  "🤔 تحتاج مساعدة؟",
  "⚡ اسألني أي شيء!",
  "🎁 عندي معلومات رائعة لك!",
  "هيا! لا تتردد 🤖✨",
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
      "📚 **آخر ما نشرناه:**\n• دليل تشغيل DeepSeek-R1 محلياً مع n8n\n• أفضل أدوات الأمن السيبراني مفتوحة المصدر\n• أتمتة النشر على فيسبوك وتيليجرام\n• تحسين PageSpeed إلى 100/100\n• خوادم سحابية مجانية للمطورين",
    link: { to: "/posts", label: "📚 جميع المقالات →" },
  },
  {
    keywords: ["أدوات", "ذكاء", "اصطناعي", "tools", "ai", "tool"],
    answer:
      "🛠️ **أدواتنا الذكية المجانية:**\n• 🖼️ توليد الصور بالذكاء الاصطناعي\n• 🔍 مساعد SEO\n• 📝 ملخص النصوص الذكي\n• 💡 مولد أفكار المحتوى\n• 🗺️ خريطة طريق التعلم\n• 🌍 مترجم ذكي\n• 🏗️ مهندس الـ Prompts",
    link: { to: "/tools", label: "🛠️ استكشف الأدوات →" },
  },
  {
    keywords: ["n8n", "أتمتة", "automation", "workflow"],
    answer:
      "⚡ **n8n والأتمتة:**\nدليل شامل لأتمتة مهامك اليومية:\n• ربط التطبيقات بدون كود\n• أتمتة النشر على السوشيال ميديا\n• بناء وكلاء AI محليين\n• تكامل مع Supabase, Google Sheets وأكثر",
    link: { to: "/posts", label: "⚡ مقالات n8n →" },
  },
  {
    keywords: ["ollama", "نماذج", "محلي", "local", "llm", "deepseek"],
    answer:
      "🤖 **تشغيل AI محلياً:**\nشروحات لتشغيل:\n• Ollama مع نماذج Llama, Mistral, DeepSeek\n• ربط النماذج المحلية مع n8n\n• حماية بياناتك 100%\n• مجاناً على جهازك!",
    link: { to: "/posts", label: "🤖 اقرأ المقالات →" },
  },
  {
    keywords: ["seo", "سيو", "بحث", "google", "جوجل", "pagespeed"],
    answer:
      "🔍 **تحسين محركات البحث:**\n• تقنيات Core Web Vitals\n• تحسين سرعة الموقع بـ Cloudflare\n• الكلمات المفتاحية والمحتوى العربي\n• Schema Markup وهيكل البيانات",
    link: { to: "/posts", label: "🔍 دروس SEO →" },
  },
  {
    keywords: ["أمن", "امن", "سيبراني", "اختراق", "هاكر", "cybersecurity"],
    answer:
      "🔐 **الأمن السيبراني:**\n• فحص الثغرات الأمنية\n• اختبار الاختراق الأخلاقي\n• حماية المواقع والسيرفرات\n• أدوات مفتوحة المصدر",
    link: { to: "/posts", label: "🔐 مقالات الأمن →" },
  },
  {
    keywords: ["عن", "من", "أكاديمية", "بويبة", "about", "bouiba"],
    answer:
      "🌟 **Bouiba Academy:**\nأكاديمية عربية في:\n• الذكاء الاصطناعي والأتمتة\n• شروحات تقنية بالعربية\n• أدوات مجانية للمطورين\n• محتوى حصري ومراجعات صادقة",
    link: { to: "/about", label: "🌟 تعرف علينا →" },
  },
  {
    keywords: ["تواصل", "contact", "اتصال", "رسالة", "بريد"],
    answer: "📩 **تواصل معنا:**\nراسلنا لأي سؤال أو اقتراح!\nنحن نحب نسمع منك 💚",
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

// ─── TTS ─────────────────────────────────────────────────────────────────────
let speechAllowed = false;
function enableSpeech() {
  speechAllowed = true;
}

function speak(text: string) {
  if (!speechAllowed || typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(
    text
      .replace(/[🐝✨🛠️📚🏷️ℹ️🔐⚡🤖🌟📩🔍🏠💡🎁🎯🔥📖🤔👀👋💬💚⚡🖼️🗺️🌍🏗️🎉🤩psst]/g, "")
      .replace(/\*\*/g, ""),
  );
  utt.lang = "ar-SA";
  utt.rate = 0.95;
  utt.pitch = 1.1;
  utt.volume = 0.85;
  const voices = window.speechSynthesis.getVoices();
  const arVoice = voices.find((v) => v.lang.startsWith("ar"));
  if (arVoice) utt.voice = arVoice;
  window.speechSynthesis.speak(utt);
}

// ─── Robot Canvas Renderer ────────────────────────────────────────────────────
function drawRobot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  talking: boolean,
  blinking: boolean,
  wiggle: number,
  reactionScale: number,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale * reactionScale, scale * reactionScale);
  ctx.rotate(Math.sin(wiggle) * 0.06);

  const s = 1.1; // Slightly larger for better detail
  const isDark = document.documentElement.classList.contains("dark");

  // 1. Futuristic thruster/propulsion glow underneath
  const glowY = 18 * s;
  const glowRadius = talking ? (18 + Math.sin(wiggle * 5) * 4) * s : 14 * s;
  const engineGlow = ctx.createRadialGradient(0, glowY, 1, 0, glowY, glowRadius);
  engineGlow.addColorStop(0, isDark ? "rgba(6, 182, 212, 0.5)" : "rgba(13, 148, 136, 0.4)");
  engineGlow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = engineGlow;
  ctx.beginPath();
  ctx.arc(0, glowY, glowRadius, 0, Math.PI * 2);
  ctx.fill();

  // 2. Hovering main body (spherical cybernetic shell)
  const bodyG = ctx.createLinearGradient(-26 * s, -26 * s, 26 * s, 26 * s);
  bodyG.addColorStop(0, isDark ? "#1E293B" : "#FFFFFF");
  bodyG.addColorStop(1, isDark ? "#0F172A" : "#E2E8F0");
  ctx.fillStyle = bodyG;
  ctx.strokeStyle = isDark ? "#06B6D4" : "#0D9488";
  ctx.lineWidth = 2.5;
  ctx.shadowColor = isDark ? "#06B6D4" : "#0D9488";
  ctx.shadowBlur = talking ? 10 : 4;
  ctx.beginPath();
  ctx.arc(0, -10 * s, 26 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;

  // 3. Floating side magnetic pod wings
  const wingOffset = Math.sin(wiggle * 3.5) * 2;
  ctx.fillStyle = isDark ? "#334155" : "#F1F5F9";
  ctx.strokeStyle = isDark ? "#22D3EE" : "#14B8A6";
  ctx.lineWidth = 2;

  // Left wing
  ctx.save();
  ctx.translate(-35 * s - wingOffset, -10 * s);
  ctx.beginPath();
  ctx.ellipse(0, 0, 4.5 * s, 11 * s, -0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Right wing
  ctx.save();
  ctx.translate(35 * s + wingOffset, -10 * s);
  ctx.beginPath();
  ctx.ellipse(0, 0, 4.5 * s, 11 * s, 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // 4. Glowing halo / Holographic signal ring floating above head
  ctx.save();
  ctx.translate(0, -42 * s + Math.sin(wiggle * 2.5) * 2);
  ctx.strokeStyle = isDark ? "rgba(6, 182, 212, 0.7)" : "rgba(13, 148, 136, 0.6)";
  ctx.lineWidth = 2.5;
  ctx.shadowColor = isDark ? "#06B6D4" : "#0D9488";
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.ellipse(0, 0, 16 * s, 4.5 * s, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // 5. Glossy dark screen visor (faceplate)
  ctx.fillStyle = "#090D16";
  ctx.beginPath();
  ctx.ellipse(0, -10 * s, 19 * s, 13 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = isDark ? "rgba(6, 182, 212, 0.4)" : "rgba(13, 148, 136, 0.3)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // 6. Interactive expressive cyber-eyes
  const eyeColor = blinking ? "#090D16" : talking ? "#00F2FE" : "#06B6D4";
  ctx.fillStyle = eyeColor;
  ctx.shadowColor = eyeColor;
  ctx.shadowBlur = blinking ? 0 : 12;

  if (blinking) {
    // Slits for blinking
    ctx.strokeStyle = isDark ? "#06B6D4" : "#0D9488";
    ctx.lineWidth = 2.5 * s;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-11 * s, -10 * s);
    ctx.lineTo(-5 * s, -10 * s);
    ctx.moveTo(5 * s, -10 * s);
    ctx.lineTo(11 * s, -10 * s);
    ctx.stroke();
  } else if (talking) {
    // Happy/talking smiling arcs
    ctx.strokeStyle = "#00F2FE";
    ctx.lineWidth = 3 * s;
    ctx.lineCap = "round";
    
    // Left eye arc
    ctx.beginPath();
    ctx.arc(-8 * s, -8 * s, 4 * s, Math.PI, 0);
    ctx.stroke();
    
    // Right eye arc
    ctx.beginPath();
    ctx.arc(8 * s, -8 * s, 4 * s, Math.PI, 0);
    ctx.stroke();
  } else {
    // Round neon glowing eyes
    ctx.beginPath();
    ctx.arc(-8 * s, -10 * s, 4 * s, 0, Math.PI * 2);
    ctx.arc(8 * s, -10 * s, 4 * s, 0, Math.PI * 2);
    ctx.fill();
    
    // Expressive high-tech eye shines
    ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
    ctx.beginPath();
    ctx.arc(-9.5 * s, -11.5 * s, 1.2 * s, 0, Math.PI * 2);
    ctx.arc(6.5 * s, -11.5 * s, 1.2 * s, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.shadowBlur = 0;

  ctx.restore();
}

// ─── Speech Bubble (DOM overlay) ─────────────────────────────────────────────
function SpeechBubble({
  text,
  x,
  y,
  visible,
}: {
  text: string;
  x: number;
  y: number;
  visible: boolean;
}) {
  return (
    <div
      style={{
        position: "fixed",
        left: x,
        top: y,
        pointerEvents: "none",
        zIndex: 9997,
        transition: "opacity 0.3s, transform 0.3s",
        opacity: visible ? 1 : 0,
        transform: visible
          ? "translate(-50%, -100%) scale(1)"
          : "translate(-50%, -100%) scale(0.8)",
      }}
    >
      <div
        className="max-w-[200px] rounded-2xl rounded-bl-none border border-teal-200 bg-white px-3 py-2 text-center text-xs font-medium text-slate-700 shadow-lg dark:border-teal-700 dark:bg-slate-900 dark:text-slate-200"
        dir="rtl"
      >
        {text}
        {/* Bubble tail */}
        <div className="absolute -bottom-2 right-4 h-0 w-0 border-l-[8px] border-r-[0px] border-t-[8px] border-l-transparent border-t-white dark:border-t-slate-900" />
      </div>
    </div>
  );
}

// ─── Chat Panel ───────────────────────────────────────────────────────────────
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
            <p key={i} className="font-bold text-teal-600 dark:text-teal-300">
              {line.slice(2, -2)}
            </p>
          );
        if (line.startsWith("• "))
          return (
            <p key={i} className="flex gap-1.5">
              <span className="shrink-0 text-teal-500">•</span>
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

// ─── Main Component ───────────────────────────────────────────────────────────
export function BouibaBot() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Canvas + physics
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const posRef = useRef({ x: 0, y: 0 });
  const velRef = useRef({ x: 0.4, y: 0.3 });
  const targetRef = useRef({ x: 0, y: 0 });
  const wiggleRef = useRef(0);
  const reactionRef = useRef(0); // 0..1 reaction intensity
  const blinkTimerRef = useRef(0);
  const blinkRef = useRef(false);
  const quipTimerRef = useRef(0);
  const isTalkingRef = useRef(false);
  const frameRef = useRef(0);
  const lastTimeRef = useRef(0);

  // Robot screen position for DOM overlays
  const [botScreenPos, setBotScreenPos] = useState({ x: 80, y: 200 });

  // Speech bubble
  const [bubble, setBubble] = useState("");
  const [bubbleVisible, setBubbleVisible] = useState(false);

  // Chat
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTalkingState, setIsTalkingState] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Has greeted?
  const hasGreetedRef = useRef(false);
  const hasVoiceGreetedRef = useRef(false);

  // ── Show bubble helper ──────────────────────────────────────────────────────
  const showBubble = useCallback((text: string, durationMs = 3200) => {
    setBubble(text);
    setBubbleVisible(true);
    speak(text);
    isTalkingRef.current = true;
    setIsTalkingState(true);
    setTimeout(() => {
      setBubbleVisible(false);
      isTalkingRef.current = false;
      setIsTalkingState(false);
    }, durationMs);
  }, []);

  // ── Voice init on first interaction ────────────────────────────────────────
  useEffect(() => {
    const activate = () => {
      enableSpeech();
      if (!hasVoiceGreetedRef.current) {
        hasVoiceGreetedRef.current = true;
        setTimeout(() => speak("مرحباً! أنا بويبو، مساعدك الذكي في Bouiba Academy!"), 600);
      }
    };
    window.addEventListener("pointerdown", activate, { once: true });
    window.addEventListener("keydown", activate, { once: true });
    return () => {
      window.removeEventListener("pointerdown", activate);
      window.removeEventListener("keydown", activate);
    };
  }, []);

  // ── Page-aware quip on route change ────────────────────────────────────────
  useEffect(() => {
    const quips = PAGE_QUIPS[pathname] ?? PAGE_QUIPS["/"];
    const q = quips[Math.floor(Math.random() * quips.length)];
    const timer = setTimeout(() => showBubble(q, 3500), 1200);
    return () => clearTimeout(timer);
  }, [pathname, showBubble]);

  // ── Mouse tracking ─────────────────────────────────────────────────────────
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  // ── Canvas animation loop ──────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    // Init position
    const isMobile = w < 768;
    posRef.current = { x: isMobile ? w * 0.15 : w * 0.12, y: h * 0.4 };
    targetRef.current = { x: w / 2, y: h / 2 };
    lastTimeRef.current = performance.now();

    const BOT_SIZE = isMobile ? 0.55 : 0.65;
    const HALF_W = 28 * BOT_SIZE;
    const HALF_H = 75 * BOT_SIZE;
    const PADDING = 20;

    const render = (now: number) => {
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = now;
      wiggleRef.current += dt * 2.2;

      // Blink logic
      blinkTimerRef.current += dt;
      if (blinkTimerRef.current > 4.0 + Math.random() * 2) {
        blinkRef.current = true;
        blinkTimerRef.current = 0;
        setTimeout(() => {
          blinkRef.current = false;
        }, 140);
      }

      // Idle quip timer
      quipTimerRef.current += dt;
      if (quipTimerRef.current > 12 + Math.random() * 10) {
        quipTimerRef.current = 0;
        if (!bubbleVisible && !chatOpen) {
          const q = IDLE_QUIPS[Math.floor(Math.random() * IDLE_QUIPS.length)];
          showBubble(q, 2800);
        }
      }

      // Physics: gentle float toward target
      let tx = targetRef.current.x;
      let ty = targetRef.current.y;

      if (chatOpen) {
        // When chat is open, hover next to the chat box (which is fixed at bottom-left)
        tx = isMobile ? w * 0.15 : 180;
        ty = isMobile ? h * 0.35 : h - 450;
      }

      const px = posRef.current.x;
      const py = posRef.current.y;

      const dx = tx - px;
      const dy = ty - py;
      const dist = Math.hypot(dx, dy);

      if (dist > 120) {
        // Follow cursor gently
        velRef.current.x += dx * 0.0018;
        velRef.current.y += dy * 0.0018;
      } else {
        // Idle drift when near target
        velRef.current.x += Math.sin(wiggleRef.current * 0.7) * 0.025;
        velRef.current.y += Math.cos(wiggleRef.current * 0.5) * 0.018;
      }

      // Damping
      velRef.current.x *= 0.94;
      velRef.current.y *= 0.94;

      // Clamp speed
      const speed = Math.hypot(velRef.current.x, velRef.current.y);
      const maxSpeed = chatOpen ? 1.2 : 3.5;
      if (speed > maxSpeed) {
        velRef.current.x = (velRef.current.x / speed) * maxSpeed;
        velRef.current.y = (velRef.current.y / speed) * maxSpeed;
      }

      posRef.current.x += velRef.current.x;
      posRef.current.y += velRef.current.y;

      // Bounce off walls
      if (posRef.current.x - HALF_W < PADDING) {
        posRef.current.x = PADDING + HALF_W;
        velRef.current.x = Math.abs(velRef.current.x) * 0.6;
      }
      if (posRef.current.x + HALF_W > w - PADDING) {
        posRef.current.x = w - PADDING - HALF_W;
        velRef.current.x = -Math.abs(velRef.current.x) * 0.6;
      }
      if (posRef.current.y - HALF_H < PADDING + 60) {
        posRef.current.y = PADDING + 60 + HALF_H;
        velRef.current.y = Math.abs(velRef.current.y) * 0.6;
      }
      if (posRef.current.y + 40 > h - PADDING) {
        posRef.current.y = h - PADDING - 40;
        velRef.current.y = -Math.abs(velRef.current.y) * 0.6;
      }

      // Reaction bounce
      if (reactionRef.current > 0) {
        reactionRef.current -= dt * 2;
        posRef.current.y -= Math.sin(reactionRef.current * Math.PI) * 30 * dt;
      }

      // Sync DOM overlay position
      setBotScreenPos({ x: posRef.current.x, y: posRef.current.y - HALF_H - 12 });

      // Render
      ctx.clearRect(0, 0, w, h);
      const reactionScale = 1 + Math.max(0, reactionRef.current) * 0.18;

      drawRobot(
        ctx,
        posRef.current.x,
        posRef.current.y,
        BOT_SIZE,
        isTalkingRef.current,
        blinkRef.current,
        wiggleRef.current,
        reactionScale,
      );

      frameRef.current = requestAnimationFrame(render);
    };

    frameRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, [chatOpen, showBubble]);

  // ── Click detection on canvas ──────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onClick = (e: PointerEvent) => {
      const dx = e.clientX - posRef.current.x;
      const dy = e.clientY - posRef.current.y;
      if (Math.hypot(dx, dy) < 55) {
        reactionRef.current = 1;
        velRef.current.y = -3;
        velRef.current.x = (Math.random() - 0.5) * 4;
        if (navigator.vibrate) navigator.vibrate([30, 50, 30]);

        if (!chatOpen) {
          // Open chat on click
          setChatOpen(true);
          if (!hasGreetedRef.current) {
            hasGreetedRef.current = true;
            setTimeout(() => {
              addBotMessage(
                "أهلاً وسهلاً! 🤖✨ أنا بويبو، مساعدك الذكي في Bouiba Academy!\nكيف يمكنني مساعدتك اليوم؟",
              );
            }, 350);
          }
        }

        // Fun reaction quip
        const quips = ["أوووخ! 😄", "هيهي! 🎉", "مرحباً! 👋", "اضحكت عليي 😂", "جاهز لمساعدتك! 💪"];
        const q = quips[Math.floor(Math.random() * quips.length)];
        setBubbleVisible(false);
        setTimeout(() => showBubble(q, 1800), 100);
      }
    };

    canvas.addEventListener("pointerdown", onClick as any);
    return () => canvas.removeEventListener("pointerdown", onClick as any);
  }, [chatOpen, showBubble]);

  // ── Auto-scroll chat ───────────────────────────────────────────────────────
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  // ── Chat helpers ───────────────────────────────────────────────────────────
  const addBotMessage = useCallback((text: string, link?: { to: string; label: string }) => {
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), from: "bot", text, link }]);
    isTalkingRef.current = true;
    setIsTalkingState(true);
    speak(text);
    const dur = Math.max(1500, text.length * 35);
    setTimeout(() => {
      isTalkingRef.current = false;
      setIsTalkingState(false);
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
          "عذراً، لم أفهم جيداً 😅\nلكن يمكنني مساعدتك في المقالات، الأدوات، n8n، SEO، والأمن السيبراني.\nاسألني بطريقة أخرى!",
        );
      }
    }, 500);
  }, [input, addBotMessage]);

  const handleQuick = useCallback(
    (id: string) => {
      const a = QUICK_ACTIONS.find((x) => x.id === id);
      if (!a) return;
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), from: "user", text: a.label }]);
      setTimeout(() => {
        const found = findAnswer(a.label);
        if (found) addBotMessage(found.answer, found.link);
      }, 400);
    },
    [addBotMessage],
  );

  // ── Chat panel position: fixed bottom-left corner (standard professional placement) ─────────
  const isMobileSize = typeof window !== "undefined" && window.innerWidth < 600;
  const chatPanelStyle: React.CSSProperties = {
    position: "fixed",
    zIndex: 9998,
    bottom: isMobileSize ? 0 : "85px",
    left: isMobileSize ? 0 : "24px",
    right: isMobileSize ? 0 : undefined,
  };

  return (
    <>
      {/* ── Floating Canvas Robot ── */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-[9996] cursor-pointer"
        style={{ pointerEvents: "none" }}
        aria-label="مساعد بويبو — انقر للتفاعل"
      />

      {/* Invisible click catcher over robot */}
      <div
        className="fixed z-[9997]"
        style={{
          left: posRef.current.x - 55,
          top: posRef.current.y - 75,
          width: 110,
          height: 120,
          cursor: "pointer",
          borderRadius: "50%",
        }}
        onClick={() => {
          reactionRef.current = 1;
          velRef.current.y = -2.5;
          if (!chatOpen) {
            setChatOpen(true);
            if (!hasGreetedRef.current) {
              hasGreetedRef.current = true;
              setTimeout(
                () =>
                  addBotMessage("أهلاً! 🤖✨ أنا بويبو — مساعدك الذكي!\nكيف يمكنني مساعدتك اليوم؟"),
                350,
              );
            }
          }
          const q = ["مرحباً 👋", "هيهي 😄", "جاهز! 💪"][Math.floor(Math.random() * 3)];
          setTimeout(() => showBubble(q, 1600), 100);
        }}
        aria-label="افتح بويبو المساعد"
        role="button"
        tabIndex={0}
      />

      {/* ── Speech Bubble ── */}
      <SpeechBubble
        text={bubble}
        x={botScreenPos.x}
        y={botScreenPos.y}
        visible={bubbleVisible && !chatOpen}
      />

      {/* ── Chat Panel ── */}
      {chatOpen && (
        <div
          style={chatPanelStyle}
          className="flex w-full max-w-[300px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
          dir="rtl"
        >
          {/* Header */}
          <div className="flex items-center gap-2 bg-gradient-to-l from-teal-700 to-teal-600 px-3.5 py-2.5">
            <div className="relative">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10">
                <span className="text-lg">🤖</span>
              </div>
              {isTalkingState && (
                <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-green-400 border-2 border-teal-700">
                  <span className="h-1.5 w-1.5 animate-ping rounded-full bg-white" />
                </span>
              )}
            </div>
            <div className="flex-1">
              <p className="font-bold text-white text-xs">بويبو 🤖</p>
              <p className="text-[10px] text-teal-200">
                {isTalkingState ? "🔊 يتحدث..." : "🟢 متصل دائماً"}
              </p>
            </div>
            <button
              onClick={() => setChatOpen(false)}
              className="rounded-full p-1 text-teal-100 hover:bg-teal-800 transition-colors"
            >
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 space-y-2.5 overflow-y-auto bg-slate-50 p-2.5 dark:bg-slate-950"
            style={{ minHeight: 140, maxHeight: 220 }}
          >
            {messages.length === 0 && (
              <div className="py-4 text-center text-slate-400 text-xs dark:text-slate-600">
                <p className="text-3xl mb-2">🤖</p>
                <p>اسألني أي شيء عن الأكاديمية!</p>
              </div>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-end gap-2 ${msg.from === "user" ? "justify-start" : "justify-end"}`}
              >
                {msg.from === "bot" && <span className="shrink-0 text-base mb-0.5">🤖</span>}
                <div
                  className={`max-w-[84%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                    msg.from === "user"
                      ? "rounded-br-none bg-teal-600 text-white"
                      : "rounded-bl-none border border-slate-100 bg-white text-slate-800 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  }`}
                >
                  {msg.from === "bot" ? (
                    <>
                      <BotText text={msg.text} />
                      {msg.link && (
                        <Link
                          to={msg.link.to as any}
                          className="mt-2 inline-flex items-center gap-1 rounded-lg border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700 transition-colors hover:bg-teal-100 dark:border-teal-700 dark:bg-teal-900/30 dark:text-teal-300"
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
            <div className="flex flex-wrap gap-1.5 border-t border-slate-100 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900">
              {QUICK_ACTIONS.map((a) => (
                <button
                  key={a.id}
                  onClick={() => handleQuick(a.id)}
                  className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700 transition-colors hover:bg-teal-100 dark:border-teal-700 dark:bg-teal-900/20 dark:text-teal-300"
                >
                  {a.label}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="flex items-center gap-2 border-t border-slate-100 bg-white px-3 py-2.5 dark:border-slate-800 dark:bg-slate-900">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="اسألني أي شيء..."
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              dir="rtl"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="rounded-xl bg-teal-600 p-2 text-white transition-all hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-40 active:scale-95"
            >
              <svg
                className="h-4 w-4 rotate-180"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path d="M22 2 11 13M22 2 15 22 11 13 2 9l20-7z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ── Collapsed FAB hint (when chat closed and no bubble) ── */}
      {!chatOpen && !bubbleVisible && (
        <div
          className="fixed bottom-5 left-5 z-[9997] rounded-full border border-teal-200 bg-white/90 px-3 py-1.5 text-xs font-medium text-teal-700 shadow-md backdrop-blur-sm dark:border-teal-700 dark:bg-slate-900/90 dark:text-teal-300"
          style={{ pointerEvents: "none" }}
        >
          انقر على بويبو 🤖
        </div>
      )}
    </>
  );
}
