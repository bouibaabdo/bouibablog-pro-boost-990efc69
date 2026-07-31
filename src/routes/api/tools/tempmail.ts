import { createFileRoute } from "@tanstack/react-router";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function err(msg: string, status = 400) {
  return Response.json({ error: msg }, { status });
}

function randomStr(len = 12) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let s = "";
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

// ─── 1secmail Provider (primary — no auth, simple, reliable) ─────────────────

// Known stable 1secmail domains
const ONESEC_DOMAINS = [
  "1secmail.com",
  "1secmail.org",
  "1secmail.net",
  "icznn.com",
  "ezztt.com",
  "vjuum.com",
  "laafd.com",
  "txcct.com",
];

// Token format for 1secmail: "1sm:<login>:<domain>"
function make1smToken(login: string, domain: string) {
  return `1sm:${login}:${domain}`;
}
function parse1smToken(token: string): { login: string; domain: string } | null {
  if (!token.startsWith("1sm:")) return null;
  const parts = token.split(":");
  if (parts.length < 3) return null;
  return { login: parts[1], domain: parts.slice(2).join(":") };
}

async function create1smAccount(): Promise<{ address: string; token: string }> {
  // First try the API's own random generator
  try {
    const res = await fetch("https://www.1secmail.com/api/v1/?action=genRandomMailbox&count=1", {
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) {
      const [address] = (await res.json()) as string[];
      if (address && address.includes("@")) {
        const [login, domain] = address.split("@");
        return { address, token: make1smToken(login, domain) };
      }
    }
  } catch {
    // fallthrough to manual generation
  }

  // Manual fallback: pick a random domain + random login
  const domain = ONESEC_DOMAINS[Math.floor(Math.random() * ONESEC_DOMAINS.length)];
  const login = randomStr(10);
  return { address: `${login}@${domain}`, token: make1smToken(login, domain) };
}

async function get1smInbox(login: string, domain: string) {
  const res = await fetch(
    `https://www.1secmail.com/api/v1/?action=getMessages&login=${encodeURIComponent(login)}&domain=${encodeURIComponent(domain)}`,
    { signal: AbortSignal.timeout(8000) },
  );
  if (!res.ok) throw new Error("فشل جلب الرسائل");
  const msgs = (await res.json()) as Array<{
    id: number;
    from: string;
    subject: string;
    date: string;
  }>;
  return msgs.map((m) => ({
    id: String(m.id),
    from: { address: m.from, name: m.from },
    subject: m.subject || "(بلا موضوع)",
    intro: "",
    createdAt: m.date,
    seen: false,
  }));
}

async function get1smMessage(login: string, domain: string, id: string) {
  const res = await fetch(
    `https://www.1secmail.com/api/v1/?action=readMessage&login=${encodeURIComponent(login)}&domain=${encodeURIComponent(domain)}&id=${encodeURIComponent(id)}`,
    { signal: AbortSignal.timeout(8000) },
  );
  if (!res.ok) throw new Error("فشل جلب الرسالة");
  const data = (await res.json()) as {
    id: number;
    from: string;
    to: string;
    subject: string;
    date: string;
    body: string;
    htmlBody: string;
    attachments?: Array<{ filename: string; contentType: string; size: number }>;
  };
  return {
    id: String(data.id),
    from: { address: data.from, name: data.from },
    to: [{ address: data.to, name: data.to }],
    subject: data.subject || "(بلا موضوع)",
    text: data.body || "",
    html: data.htmlBody || "",
    createdAt: data.date,
    attachments: (data.attachments ?? []).map((a) => ({ filename: a.filename, size: a.size })),
  };
}

// ─── mail.tm Provider (secondary fallback) ────────────────────────────────────

const MAILTM_BASE = "https://api.mail.tm";

async function getMailtmDomains(): Promise<string[]> {
  const res = await fetch(`${MAILTM_BASE}/domains?page=1`, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(6000),
  });
  if (!res.ok) return [];
  const data = (await res.json()) as {
    "hydra:member": Array<{ domain: string; isActive?: boolean }>;
  };
  // Accept all domains, active or not (some providers omit isActive)
  return (data["hydra:member"] ?? []).map((d) => d.domain).filter(Boolean);
}

async function createMailtmAccount(): Promise<{ address: string; token: string }> {
  const domains = await getMailtmDomains();
  if (!domains.length) throw new Error("mail.tm: no domains");

  const domain = domains[0];
  const username = randomStr(10);
  const password = randomStr(14) + "A1!";
  const address = `${username}@${domain}`;

  const accRes = await fetch(`${MAILTM_BASE}/accounts`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ address, password }),
    signal: AbortSignal.timeout(10000),
  });
  if (!accRes.ok) throw new Error("mail.tm: account creation failed");

  const tokRes = await fetch(`${MAILTM_BASE}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ address, password }),
    signal: AbortSignal.timeout(8000),
  });
  if (!tokRes.ok) throw new Error("mail.tm: token failed");
  const { token } = (await tokRes.json()) as { token: string };
  return { address, token };
}

// ─── Route ────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/api/tools/tempmail")({
  server: {
    handlers: {
      // POST → create a new temporary inbox
      // Strategy: 1secmail first (reliable, no auth), mail.tm as fallback
      POST: async () => {
        try {
          // Admin toggle
          try {
            const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
            const { data: tool } = await supabaseAdmin
              .from("admin_ai_tools")
              .select("enabled")
              .eq("tool_key", "tempmail")
              .maybeSingle();
            if (tool && tool.enabled === false) {
              return err("هذه الأداة معطّلة حاليًا.", 403);
            }
          } catch {
            // fail open
          }

          // 1. Try 1secmail (primary — simple, reliable)
          try {
            const result = await create1smAccount();
            return Response.json(result);
          } catch {
            // 2. Fallback: mail.tm
          }

          try {
            const result = await createMailtmAccount();
            return Response.json(result);
          } catch {
            // Both providers failed
          }

          return err("تعذّر إنشاء الإيميل المؤقت. يرجى المحاولة مجدداً بعد لحظات.", 503);
        } catch (e) {
          const msg = e instanceof Error ? e.message : "خطأ غير متوقع";
          return err(msg, 500);
        }
      },

      // GET → inbox / message / delete
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const action = url.searchParams.get("action");
        const token = url.searchParams.get("token");

        if (!token) return err("توكن مفقود");

        try {
          // ── 1secmail branch ──────────────────────────────────────────────
          const parsed1sm = parse1smToken(token);
          if (parsed1sm) {
            const { login, domain } = parsed1sm;

            if (action === "inbox") {
              const messages = await get1smInbox(login, domain);
              return Response.json({ messages, total: messages.length });
            }

            if (action === "message") {
              const id = url.searchParams.get("id");
              if (!id) return err("معرّف الرسالة مفقود");
              const msg = await get1smMessage(login, domain, id);
              return Response.json(msg);
            }

            if (action === "delete") {
              // 1secmail has no delete API — just confirm to client
              return Response.json({ deleted: true });
            }

            return err("إجراء غير معروف");
          }

          // ── mail.tm branch ───────────────────────────────────────────────
          const authHeader = { Authorization: `Bearer ${token}`, Accept: "application/json" };

          if (action === "inbox") {
            const res = await fetch(`${MAILTM_BASE}/messages?page=1`, {
              headers: authHeader,
              signal: AbortSignal.timeout(8000),
            });
            if (res.status === 401) return err("جلسة منتهية، يرجى إنشاء إيميل جديد", 401);
            if (!res.ok) return err("فشل جلب الرسائل", 500);
            const data = (await res.json()) as {
              "hydra:member": Array<{
                id: string;
                from: { address: string; name: string };
                subject: string;
                intro: string;
                createdAt: string;
                seen: boolean;
              }>;
              "hydra:totalItems": number;
            };
            return Response.json({
              messages: data["hydra:member"] ?? [],
              total: data["hydra:totalItems"] ?? 0,
            });
          }

          if (action === "message") {
            const id = url.searchParams.get("id");
            if (!id) return err("معرّف الرسالة مفقود");
            const res = await fetch(`${MAILTM_BASE}/messages/${encodeURIComponent(id)}`, {
              headers: authHeader,
              signal: AbortSignal.timeout(8000),
            });
            if (res.status === 401) return err("جلسة منتهية", 401);
            if (res.status === 404) return err("الرسالة غير موجودة", 404);
            if (!res.ok) return err("فشل جلب الرسالة", 500);
            const data = (await res.json()) as {
              id: string;
              from: { address: string; name: string };
              to: Array<{ address: string; name: string }>;
              subject: string;
              text: string;
              html: string[];
              createdAt: string;
              attachments: Array<{ filename: string; size: number }>;
            };
            return Response.json({
              id: data.id,
              from: data.from,
              to: data.to,
              subject: data.subject,
              text: data.text ?? "",
              html: (data.html ?? []).join(""),
              createdAt: data.createdAt,
              attachments: data.attachments ?? [],
            });
          }

          if (action === "delete") {
            const meRes = await fetch(`${MAILTM_BASE}/me`, {
              headers: authHeader,
              signal: AbortSignal.timeout(6000),
            });
            if (!meRes.ok) return err("فشل جلب بيانات الحساب", 500);
            const me = (await meRes.json()) as { id: string };
            const delRes = await fetch(`${MAILTM_BASE}/accounts/${me.id}`, {
              method: "DELETE",
              headers: authHeader,
              signal: AbortSignal.timeout(6000),
            });
            if (!delRes.ok && delRes.status !== 204) return err("فشل حذف الحساب", 500);
            return Response.json({ deleted: true });
          }

          return err("إجراء غير معروف");
        } catch (e) {
          const msg = e instanceof Error ? e.message : "خطأ في الاتصال بخادم الإيميل";
          return err(msg, 500);
        }
      },
    },
  },
});
