import { createFileRoute } from "@tanstack/react-router";

const MAILTM_BASE = "https://api.mail.tm";

// Helper: forward errors as JSON responses
function err(msg: string, status = 400) {
  return Response.json({ error: msg }, { status });
}

// Generate a random alphanumeric string
function randomStr(len = 12) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let s = "";
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

// Fetch available mail.tm domains
async function getDomains(): Promise<string[]> {
  const res = await fetch(`${MAILTM_BASE}/domains?page=1`, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error("فشل جلب النطاقات");
  const data = (await res.json()) as {
    "hydra:member": Array<{ domain: string; isActive: boolean }>;
  };
  return (data["hydra:member"] ?? []).filter((d) => d.isActive).map((d) => d.domain);
}

// Create a new mail.tm account and return token + address
async function createAccount(): Promise<{ address: string; token: string }> {
  const domains = await getDomains();
  if (!domains.length) throw new Error("لا توجد نطاقات متاحة حالياً");

  const domain = domains[0];
  const username = randomStr(10);
  const password = randomStr(16) + "A1!"; // meets complexity reqs
  const address = `${username}@${domain}`;

  // Create account
  const accRes = await fetch(`${MAILTM_BASE}/accounts`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ address, password }),
    signal: AbortSignal.timeout(10000),
  });
  if (!accRes.ok) {
    const e = (await accRes.json().catch(() => ({}))) as { detail?: string };
    throw new Error(e.detail || "فشل إنشاء الحساب");
  }

  // Get JWT token
  const tokRes = await fetch(`${MAILTM_BASE}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ address, password }),
    signal: AbortSignal.timeout(8000),
  });
  if (!tokRes.ok) throw new Error("فشل الحصول على التوكن");
  const { token } = (await tokRes.json()) as { token: string };

  return { address, token };
}

export const Route = createFileRoute("/api/tools/tempmail")({
  server: {
    handlers: {
      // POST /api/tools/tempmail → Create new temporary email account
      POST: async () => {
        try {
          // Admin enable/disable check
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

          const { address, token } = await createAccount();
          return Response.json({ address, token });
        } catch (e) {
          const msg = e instanceof Error ? e.message : "خطأ غير متوقع";
          return err(msg, 500);
        }
      },

      // GET /api/tools/tempmail?action=inbox&token=... → Fetch messages list
      // GET /api/tools/tempmail?action=message&id=...&token=... → Fetch single message
      // GET /api/tools/tempmail?action=delete&token=... → Delete account
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const action = url.searchParams.get("action");
        const token = url.searchParams.get("token");

        if (!token) return err("توكن مفقود");

        const authHeader = { Authorization: `Bearer ${token}`, Accept: "application/json" };

        try {
          if (action === "inbox") {
            // Fetch messages list (page 1, newest first)
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
            // Fetch account id first
            const meRes = await fetch(`${MAILTM_BASE}/me`, {
              headers: authHeader,
              signal: AbortSignal.timeout(6000),
            });
            if (!meRes.ok) return err("فشل جلب بيانات الحساب", 500);
            const me = (await meRes.json()) as { id: string };
            // Delete account
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
