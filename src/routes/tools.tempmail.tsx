import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Mail,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  Loader2,
  Inbox,
  ArrowRight,
  Clock,
  AlertTriangle,
  MailOpen,
  ChevronLeft,
  Zap,
  ChevronDown,
  Globe,
  Timer,
} from "lucide-react";
import { buildSeo } from "@/lib/seo";

export const Route = createFileRoute("/tools/tempmail")({
  head: () => ({
    ...buildSeo({
      path: "/tools/tempmail",
      title: "إيميل مؤقت مجاني | Bouiba Academy",
      description:
        "احصل على إيميل مؤقت فوري ومجاني لحماية خصوصيتك عند التسجيل في المواقع. اختر النطاق والمدة. يتلقى الرسائل تلقائياً.",
      keywords: [
        "إيميل مؤقت",
        "بريد إلكتروني مؤقت",
        "disposable email",
        "بريد مجهول",
        "حماية الخصوصية",
      ],
    }),
  }),
  component: TempMailTool,
});

// ─── Types ────────────────────────────────────────────────────────────────────

type Message = {
  id: string;
  from: { address: string; name: string };
  subject: string;
  intro: string;
  createdAt: string;
  seen: boolean;
};

type MessageDetail = {
  id: string;
  from: { address: string; name: string };
  to: Array<{ address: string; name: string }>;
  subject: string;
  text: string;
  html: string;
  createdAt: string;
  attachments: Array<{ filename: string; size: number }>;
};

// ─── Duration options ─────────────────────────────────────────────────────────

const DURATIONS = [
  { label: "10 دقائق", seconds: 10 * 60, key: "10m" },
  { label: "30 دقيقة", seconds: 30 * 60, key: "30m" },
  { label: "ساعة واحدة", seconds: 60 * 60, key: "1h" },
] as const;
type DurationKey = (typeof DURATIONS)[number]["key"];

const POLL_MS = 8_000; // 8 seconds

// ─── Utilities ────────────────────────────────────────────────────────────────

function sanitizeHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/on\w+='[^']*'/gi, "")
    .replace(/javascript:/gi, "");
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function relativeTime(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "الآن";
  if (diff < 3600) return `منذ ${Math.floor(diff / 60)} دقيقة`;
  return `منذ ${Math.floor(diff / 3600)} ساعة`;
}

// ─── Component ────────────────────────────────────────────────────────────────

function TempMailTool() {
  // Session state
  const [address, setAddress] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selected, setSelected] = useState<MessageDetail | null>(null);

  // Loading states
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingInbox, setLoadingInbox] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(false);
  const [loadingDomains, setLoadingDomains] = useState(false);

  // Error
  const [error, setError] = useState<string | null>(null);

  // Copy
  const [copied, setCopied] = useState(false);

  // Timer
  const [timeLeft, setTimeLeft] = useState(DURATIONS[0].seconds);
  const [totalSeconds, setTotalSeconds] = useState(DURATIONS[0].seconds);

  // New message animation
  const [newMsgIds, setNewMsgIds] = useState<Set<string>>(new Set());
  const prevIdsRef = useRef<Set<string>>(new Set());

  // Refs for intervals
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Config before creation
  const [selectedDuration, setSelectedDuration] = useState<DurationKey>("10m");
  const [domains, setDomains] = useState<string[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string>("auto");

  // ── Load domains on mount ─────────────────────────────────────────────────
  useEffect(() => {
    setLoadingDomains(true);
    fetch("/api/tools/tempmail?action=domains")
      .then((r) => r.json())
      .then((data: { domains?: string[] }) => {
        if (data.domains?.length) setDomains(data.domains);
      })
      .catch(() => {})
      .finally(() => setLoadingDomains(false));
  }, []);

  // ── Polling / timer cleanup ───────────────────────────────────────────────
  const stopAll = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  useEffect(() => () => stopAll(), [stopAll]);

  // ── Fetch inbox ───────────────────────────────────────────────────────────
  const fetchInbox = useCallback(
    async (tok: string) => {
      if (!tok) return;
      setLoadingInbox(true);
      try {
        const res = await fetch(
          `/api/tools/tempmail?action=inbox&token=${encodeURIComponent(tok)}`,
        );
        if (res.status === 401) {
          stopAll();
          setError("انتهت الجلسة. أنشئ إيميلاً جديداً.");
          return;
        }
        const data = (await res.json()) as { messages?: Message[]; error?: string };
        if (data.messages) {
          const fresh = new Set<string>();
          data.messages.forEach((m) => {
            if (!prevIdsRef.current.has(m.id)) fresh.add(m.id);
          });
          if (fresh.size > 0) setNewMsgIds(fresh);
          prevIdsRef.current = new Set(data.messages.map((m) => m.id));
          setMessages(data.messages);
        }
      } catch {
        // silent — keep polling
      } finally {
        setLoadingInbox(false);
      }
    },
    [stopAll],
  );

  // ── Start session ─────────────────────────────────────────────────────────
  const startSession = useCallback(
    (addr: string, tok: string, durationSecs: number) => {
      stopAll();
      setAddress(addr);
      setToken(tok);
      setMessages([]);
      setSelected(null);
      setError(null);
      setNewMsgIds(new Set());
      prevIdsRef.current = new Set();
      setTimeLeft(durationSecs);
      setTotalSeconds(durationSecs);

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            stopAll();
            setError("انتهت مدة الصلاحية. يمكنك إنشاء إيميل جديد.");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      fetchInbox(tok);
      pollRef.current = setInterval(() => fetchInbox(tok), POLL_MS);
    },
    [fetchInbox, stopAll],
  );

  // ── Create email ──────────────────────────────────────────────────────────
  const createEmail = useCallback(async () => {
    setLoadingCreate(true);
    setError(null);
    stopAll();
    try {
      const durObj = DURATIONS.find((d) => d.key === selectedDuration) ?? DURATIONS[0];
      const body: { domain?: string } = {};
      if (selectedDomain !== "auto") body.domain = selectedDomain;

      const res = await fetch("/api/tools/tempmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { address?: string; token?: string; error?: string };
      if (!res.ok || !data.address || !data.token) {
        setError(data.error || "فشل إنشاء الإيميل، حاول مرة أخرى.");
        return;
      }
      startSession(data.address, data.token, durObj.seconds);
    } catch {
      setError("فشل الاتصال بالخادم. تحقق من اتصالك بالإنترنت.");
    } finally {
      setLoadingCreate(false);
    }
  }, [selectedDomain, selectedDuration, startSession, stopAll]);

  // ── Delete / reset ────────────────────────────────────────────────────────
  const deleteAndReset = useCallback(async () => {
    stopAll();
    if (token) {
      try {
        await fetch(`/api/tools/tempmail?action=delete&token=${encodeURIComponent(token)}`);
      } catch {
        // silent
      }
    }
    setAddress(null);
    setToken(null);
    setMessages([]);
    setSelected(null);
    setError(null);
    setNewMsgIds(new Set());
    prevIdsRef.current = new Set();
  }, [token, stopAll]);

  // ── Open message ──────────────────────────────────────────────────────────
  const openMessage = useCallback(
    async (msg: Message) => {
      if (!token) return;
      setLoadingMsg(true);
      setSelected(null);
      setNewMsgIds((prev) => {
        const next = new Set(prev);
        next.delete(msg.id);
        return next;
      });
      try {
        const res = await fetch(
          `/api/tools/tempmail?action=message&id=${encodeURIComponent(msg.id)}&token=${encodeURIComponent(token)}`,
        );
        const data = (await res.json()) as MessageDetail & { error?: string };
        if (!res.ok) {
          setError(data.error || "فشل جلب الرسالة");
          return;
        }
        setSelected(data);
      } catch {
        setError("فشل تحميل الرسالة");
      } finally {
        setLoadingMsg(false);
      }
    },
    [token],
  );

  // ── Copy address ──────────────────────────────────────────────────────────
  const copyAddress = useCallback(async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [address]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const progress = totalSeconds > 0 ? (timeLeft / totalSeconds) * 100 : 0;
  const isExpired = timeLeft === 0;
  const timerColor =
    progress > 50 ? "bg-emerald-500" : progress > 20 ? "bg-amber-500" : "bg-red-500";

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <section className="container-page py-10 md:py-16 max-w-5xl" dir="rtl">
      {/* Back */}
      <Link
        to="/tools"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowRight className="h-4 w-4" />
        كل الأدوات
      </Link>

      {/* Page title */}
      <div className="flex items-center gap-3 mb-2">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
          <Mail className="h-5 w-5 text-primary" />
        </span>
        <h1 className="font-display text-3xl md:text-4xl font-extrabold">الإيميل المؤقت</h1>
      </div>
      <p className="text-muted-foreground mb-6">
        احصل على إيميل مؤقت فوري لحماية بريدك الحقيقي. اختر النطاق والمدة واستقبل الرسائل تلقائياً.
      </p>

      {/* Warning */}
      <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-300/50 bg-amber-50/60 dark:bg-amber-950/30 dark:border-amber-500/30 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
        <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
        <p>
          <strong>تنبيه:</strong> إذا لم تصل رسائل التفعيل، جرّب تغيير النطاق — بعض المواقع تحجب
          نطاقات معروفة. اختر نطاقاً مختلفاً وأعد المحاولة.
        </p>
      </div>

      {!address ? (
        /* ═══════════════════════════════════════════════════
           SETUP PANEL (before session)
        ════════════════════════════════════════════════════ */
        <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-soft space-y-6">
          {/* Hero icon */}
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Zap className="h-8 w-8 text-primary" />
            </div>
            <h2 className="font-display text-xl font-bold mb-1">اضبط إعداداتك ثم أنشئ الإيميل</h2>
            <p className="text-muted-foreground text-sm">يُنشأ فوراً — لا تسجيل، لا كلمة مرور</p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {/* Duration selector */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <Timer className="h-4 w-4 text-primary" />
                مدة الصلاحية
              </label>
              <div className="flex gap-2 flex-wrap">
                {DURATIONS.map((d) => (
                  <button
                    key={d.key}
                    onClick={() => setSelectedDuration(d.key)}
                    className={`flex-1 min-w-[80px] rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                      selectedDuration === d.key
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "border-border bg-background hover:bg-muted/60 text-foreground"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Domain selector */}
            <div className="space-y-2">
              <label
                htmlFor="domain-select"
                className="flex items-center gap-1.5 text-sm font-semibold text-foreground"
              >
                <Globe className="h-4 w-4 text-primary" />
                النطاق
                {loadingDomains && (
                  <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                )}
              </label>
              <div className="relative">
                <select
                  id="domain-select"
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-border bg-background px-3 py-2.5 pr-8 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="auto">🔀 اختيار تلقائي (موصى به)</option>
                  {domains.map((d) => (
                    <option key={d} value={d}>
                      @{d}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">
                إذا لم تصل رسائل، جرّب نطاقاً مختلفاً. نطاقات أقل شهرة = احتمال أعلى للوصول.
              </p>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <button
            onClick={createEmail}
            disabled={loadingCreate}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 text-base font-bold text-primary-foreground shadow-lg transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingCreate ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                جارٍ الإنشاء...
              </>
            ) : (
              <>
                <Mail className="h-5 w-5" />
                إنشاء إيميل مؤقت
              </>
            )}
          </button>
        </div>
      ) : (
        /* ═══════════════════════════════════════════════════
           ACTIVE SESSION
        ════════════════════════════════════════════════════ */
        <div className="space-y-4">
          {/* Address card */}
          <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 p-5 shadow-soft">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground mb-1">إيميلك المؤقت</p>
                <p
                  className="font-mono text-lg font-bold text-primary break-all select-all cursor-pointer"
                  title="اضغط للنسخ"
                  onClick={copyAddress}
                >
                  {address}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <button
                  onClick={copyAddress}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold hover:bg-accent transition"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  {copied ? "تم النسخ" : "نسخ"}
                </button>
                <button
                  onClick={createEmail}
                  disabled={loadingCreate}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold hover:bg-accent transition disabled:opacity-50"
                  title="إيميل جديد"
                >
                  <RefreshCw className={`h-4 w-4 ${loadingCreate ? "animate-spin" : ""}`} />
                  جديد
                </button>
                <button
                  onClick={deleteAndReset}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive hover:bg-destructive/20 transition"
                >
                  <Trash2 className="h-4 w-4" />
                  إلغاء
                </button>
              </div>
            </div>

            {/* Timer bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {isExpired ? "انتهت الصلاحية" : `ينتهي خلال ${formatTime(timeLeft)}`}
                </span>
                <span className="font-mono">{Math.round(progress)}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-border overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${timerColor}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Domain quick-switch while active */}
          <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-4 py-2.5 text-sm">
            <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">لم تصل رسائل؟ غيّر النطاق:</span>
            <div className="relative flex-1 min-w-0">
              <select
                value={selectedDomain}
                onChange={(e) => {
                  setSelectedDomain(e.target.value);
                }}
                className="w-full appearance-none rounded-lg border border-border bg-background px-2 py-1 pr-6 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary/50"
              >
                <option value="auto">تلقائي</option>
                {domains.map((d) => (
                  <option key={d} value={d}>
                    @{d}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute left-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            </div>
            <button
              onClick={createEmail}
              disabled={loadingCreate}
              className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50 transition"
            >
              <RefreshCw className={`h-3 w-3 ${loadingCreate ? "animate-spin" : ""}`} />
              إعادة إنشاء
            </button>
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Inbox + Message viewer */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Inbox list */}
            <div className="rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <Inbox className="h-4 w-4 text-primary" />
                  صندوق الوارد
                  {messages.length > 0 && (
                    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs text-primary-foreground font-bold">
                      {messages.length}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => token && fetchInbox(token)}
                  disabled={loadingInbox || isExpired}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-40 transition"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${loadingInbox ? "animate-spin" : ""}`} />
                  تحديث
                </button>
              </div>

              <div className="divide-y divide-border">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                    {loadingInbox ? (
                      <>
                        <Loader2 className="h-7 w-7 animate-spin text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">جارٍ التحقق...</p>
                      </>
                    ) : (
                      <>
                        <MailOpen className="h-9 w-9 text-muted-foreground/40 mb-2" />
                        <p className="text-sm font-medium text-muted-foreground">
                          لا توجد رسائل بعد
                        </p>
                        <p className="text-xs text-muted-foreground/60 mt-1">
                          يتجدد كل {POLL_MS / 1000} ثوانٍ تلقائياً
                        </p>
                      </>
                    )}
                  </div>
                ) : (
                  messages.map((msg) => (
                    <button
                      key={msg.id}
                      onClick={() => openMessage(msg)}
                      className={`w-full text-start px-4 py-3 hover:bg-muted/50 transition relative ${
                        selected?.id === msg.id ? "bg-primary/5 border-r-2 border-r-primary" : ""
                      }`}
                    >
                      {newMsgIds.has(msg.id) && (
                        <span className="absolute top-3 left-3 h-2 w-2 rounded-full bg-primary animate-pulse" />
                      )}
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className="text-xs font-medium text-muted-foreground truncate max-w-[150px]">
                          {msg.from.name || msg.from.address}
                        </span>
                        <span className="text-xs text-muted-foreground/60 shrink-0">
                          {relativeTime(msg.createdAt)}
                        </span>
                      </div>
                      <p
                        className={`text-sm truncate ${!msg.seen ? "font-bold text-foreground" : "text-muted-foreground"}`}
                      >
                        {msg.subject || "(بلا موضوع)"}
                      </p>
                      {msg.intro && (
                        <p className="text-xs text-muted-foreground/70 truncate mt-0.5">
                          {msg.intro}
                        </p>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Message detail */}
            <div className="rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-muted/30">
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <MailOpen className="h-4 w-4 text-primary" />
                  محتوى الرسالة
                </div>
              </div>
              <div className="p-4 min-h-[280px]">
                {loadingMsg ? (
                  <div className="flex items-center justify-center h-full py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : selected ? (
                  <div className="space-y-3">
                    <button
                      onClick={() => setSelected(null)}
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-1 transition"
                    >
                      <ChevronLeft className="h-3 w-3" />
                      العودة
                    </button>
                    <div>
                      <h3 className="font-bold text-foreground leading-snug">
                        {selected.subject || "(بلا موضوع)"}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        من: <span className="font-mono">{selected.from.address}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(selected.createdAt).toLocaleString("ar-MA")}
                      </p>
                    </div>
                    <div className="border-t border-border pt-3">
                      {selected.html ? (
                        <div
                          className="prose prose-sm max-w-none text-foreground overflow-auto max-h-80 text-sm leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: sanitizeHtml(selected.html) }}
                        />
                      ) : (
                        <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed">
                          {selected.text || "الرسالة فارغة"}
                        </pre>
                      )}
                    </div>
                    {selected.attachments.length > 0 && (
                      <div className="border-t border-border pt-3">
                        <p className="text-xs font-semibold text-muted-foreground mb-2">
                          المرفقات ({selected.attachments.length})
                        </p>
                        <div className="space-y-1">
                          {selected.attachments.map((a, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground"
                            >
                              <span className="truncate">{a.filename}</span>
                              <span className="shrink-0">({Math.round(a.size / 1024)} KB)</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                    <MailOpen className="h-9 w-9 text-muted-foreground/30 mb-2" />
                    <p className="text-sm text-muted-foreground">اختر رسالة من القائمة</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="rounded-xl border border-border bg-muted/30 px-5 py-4 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground mb-2">💡 نصائح للحصول على الرسائل</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>إذا لم تصل رسائل خلال دقيقة، جرّب نطاقاً مختلفاً من القائمة أعلاه.</li>
              <li>النطاقات الأقل شهرة (مثل ycznn.com أو laafd.com) تجتاز مرشحات السبام أحياناً.</li>
              <li>بعض المواقع تأخر إرسال بريد التفعيل — انتظر حتى دقيقتين.</li>
              <li>تأكد من نسخ الإيميل كاملاً بما في ذلك النطاق.</li>
            </ol>
          </div>
        </div>
      )}
    </section>
  );
}
