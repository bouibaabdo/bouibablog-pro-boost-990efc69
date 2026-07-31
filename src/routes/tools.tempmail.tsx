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
} from "lucide-react";
import { buildSeo } from "@/lib/seo";

export const Route = createFileRoute("/tools/tempmail")({
  head: () => ({
    ...buildSeo({
      path: "/tools/tempmail",
      title: "إيميل مؤقت مجاني | Bouiba Academy",
      description:
        "احصل على إيميل مؤقت فوري ومجاني لحماية خصوصيتك عند التسجيل في المواقع. يتلقى الرسائل تلقائياً ولا يتطلب تسجيلاً.",
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

const EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const POLL_MS = 10_000; // 10 seconds

function sanitizeHtml(html: string): string {
  // Strip script/style/iframe tags to prevent XSS before rendering
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/on\w+='[^']*'/gi, "")
    .replace(/javascript:/gi, "");
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function relativeTime(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "الآن";
  if (diff < 3600) return `منذ ${Math.floor(diff / 60)} دقيقة`;
  return `منذ ${Math.floor(diff / 3600)} ساعة`;
}

function TempMailTool() {
  const [address, setAddress] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selected, setSelected] = useState<MessageDetail | null>(null);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingInbox, setLoadingInbox] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(EXPIRY_MS / 1000);
  const [newMsgIds, setNewMsgIds] = useState<Set<string>>(new Set());
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevIdsRef = useRef<Set<string>>(new Set());

  const stopPolling = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const fetchInbox = useCallback(
    async (tok: string) => {
      if (!tok) return;
      setLoadingInbox(true);
      try {
        const res = await fetch(
          `/api/tools/tempmail?action=inbox&token=${encodeURIComponent(tok)}`,
        );
        if (res.status === 401) {
          stopPolling();
          setError("انتهت الجلسة. أنشئ إيميلاً جديداً.");
          return;
        }
        const data = (await res.json()) as { messages?: Message[]; error?: string };
        if (data.messages) {
          const incoming = data.messages;
          const incoming_ids = new Set(incoming.map((m) => m.id));
          // Detect new messages
          const fresh = new Set<string>();
          incoming.forEach((m) => {
            if (!prevIdsRef.current.has(m.id)) fresh.add(m.id);
          });
          if (fresh.size > 0) setNewMsgIds(fresh);
          prevIdsRef.current = incoming_ids;
          setMessages(incoming);
        }
      } catch {
        // silent — keep polling
      } finally {
        setLoadingInbox(false);
      }
    },
    [stopPolling],
  );

  const startSession = useCallback(
    (addr: string, tok: string) => {
      stopPolling();
      setAddress(addr);
      setToken(tok);
      setMessages([]);
      setSelected(null);
      setError(null);
      setNewMsgIds(new Set());
      prevIdsRef.current = new Set();
      setTimeLeft(EXPIRY_MS / 1000);

      // Countdown timer
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            stopPolling();
            setError("انتهت مدة صلاحية الإيميل. يمكنك إنشاء إيميل جديد.");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Polling
      fetchInbox(tok);
      pollRef.current = setInterval(() => fetchInbox(tok), POLL_MS);
    },
    [fetchInbox, stopPolling],
  );

  const createEmail = useCallback(async () => {
    setLoadingCreate(true);
    setError(null);
    stopPolling();
    try {
      const res = await fetch("/api/tools/tempmail", { method: "POST" });
      const data = (await res.json()) as { address?: string; token?: string; error?: string };
      if (!res.ok || !data.address || !data.token) {
        setError(data.error || "فشل إنشاء الإيميل، حاول مرة أخرى.");
        return;
      }
      startSession(data.address, data.token);
    } catch {
      setError("فشل الاتصال بالخادم. تحقق من اتصالك بالإنترنت.");
    } finally {
      setLoadingCreate(false);
    }
  }, [startSession, stopPolling]);

  const deleteAndReset = useCallback(async () => {
    stopPolling();
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
    setTimeLeft(EXPIRY_MS / 1000);
    prevIdsRef.current = new Set();
  }, [token, stopPolling]);

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

  const copyAddress = useCallback(async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [address]);

  useEffect(() => () => stopPolling(), [stopPolling]);

  const progress = (timeLeft / (EXPIRY_MS / 1000)) * 100;
  const isExpired = timeLeft === 0;
  const timerColor =
    progress > 50 ? "bg-emerald-500" : progress > 20 ? "bg-amber-500" : "bg-red-500";

  return (
    <section className="container-page py-10 md:py-16 max-w-5xl" dir="rtl">
      {/* Back link */}
      <Link
        to="/tools"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowRight className="h-4 w-4" />
        كل الأدوات
      </Link>

      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
          <Mail className="h-5 w-5 text-primary" />
        </span>
        <h1 className="font-display text-3xl md:text-4xl font-extrabold">الإيميل المؤقت</h1>
      </div>
      <p className="text-muted-foreground mb-8">
        احصل على إيميل مؤقت فوري لحماية بريدك الحقيقي عند التسجيل في المواقع والخدمات.
      </p>

      {/* Security Warning */}
      <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-300/50 bg-amber-50/60 dark:bg-amber-950/30 dark:border-amber-500/30 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
        <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
        <p>
          <strong>تحذير:</strong> هذا الإيميل مؤقت وغير مشفر. لا تستخدمه لاستقبال بيانات حساسة أو
          كلمات مرور مهمة. الرسائل مرئية لمن يعرف العنوان.
        </p>
      </div>

      {/* Main content */}
      {!address ? (
        /* === No active session: Landing state === */
        <div className="rounded-2xl border border-border bg-card p-10 text-center shadow-soft">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Zap className="h-10 w-10 text-primary" />
          </div>
          <h2 className="font-display text-2xl font-bold mb-2">إيميل مؤقت في ثانية واحدة</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            اضغط الزر أدناه وستحصل فوراً على إيميل صالح لمدة 10 دقائق يستقبل الرسائل تلقائياً.
          </p>
          {error && (
            <div className="mb-6 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <button
            onClick={createEmail}
            disabled={loadingCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-lg font-bold text-primary-foreground shadow-lg transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
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
        /* === Active session === */
        <div className="space-y-4">
          {/* Email address card */}
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
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={copyAddress}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold hover:bg-accent transition"
                  title="نسخ الإيميل"
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
                  title="حذف وإلغاء"
                >
                  <Trash2 className="h-4 w-4" />
                  حذف
                </button>
              </div>
            </div>

            {/* Timer bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {isExpired ? "انتهت الصلاحية" : `ينتهي خلال ${formatTime(timeLeft)}`}
                </span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-border overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${timerColor}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Error banner */}
          {error && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Inbox + Message viewer split */}
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
                  title="تحديث"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${loadingInbox ? "animate-spin" : ""}`} />
                  تحديث
                </button>
              </div>

              <div className="divide-y divide-border">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                    {loadingInbox ? (
                      <>
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-3" />
                        <p className="text-sm text-muted-foreground">جارٍ التحقق من الرسائل...</p>
                      </>
                    ) : (
                      <>
                        <MailOpen className="h-10 w-10 text-muted-foreground/40 mb-3" />
                        <p className="text-sm font-medium text-muted-foreground">
                          لا توجد رسائل بعد
                        </p>
                        <p className="text-xs text-muted-foreground/60 mt-1">
                          يتم التحديث تلقائياً كل 10 ثوانٍ
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
                        <span className="text-xs font-medium text-muted-foreground truncate max-w-[140px]">
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

            {/* Message detail panel */}
            <div className="rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-muted/30">
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <MailOpen className="h-4 w-4 text-primary" />
                  محتوى الرسالة
                </div>
              </div>

              <div className="p-4 h-full min-h-[280px]">
                {loadingMsg ? (
                  <div className="flex items-center justify-center h-full py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : selected ? (
                  <div className="space-y-3">
                    <div>
                      <button
                        onClick={() => setSelected(null)}
                        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-3 transition"
                      >
                        <ChevronLeft className="h-3 w-3" />
                        العودة للقائمة
                      </button>
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
                              <span className="shrink-0">({Math.round(a.size / 1024)}KB)</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                    <MailOpen className="h-10 w-10 text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground">
                      اختر رسالة من القائمة لعرض محتواها
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* How it works mini guide */}
          <div className="rounded-xl border border-border bg-muted/30 px-5 py-4 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground mb-2">كيف يعمل؟</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>انسخ الإيميل المُنشأ أعلاه.</li>
              <li>استخدمه للتسجيل في أي موقع.</li>
              <li>ستصل رسائل التفعيل هنا تلقائياً خلال ثوانٍ.</li>
              <li>اضغط على الرسالة لقراءة كود التحقق أو رابط التفعيل.</li>
            </ol>
          </div>
        </div>
      )}
    </section>
  );
}
