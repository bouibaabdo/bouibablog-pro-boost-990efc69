import { createFileRoute } from "@tanstack/react-router";

type GeminiPart = {
  inlineData?: { data: string; mimeType: string };
  inline_data?: { data: string; mimeType?: string; mime_type?: string };
  text?: string;
};

// Fallback high-speed AI image engine (Pollinations AI: 100% free, high quality, unlimited)
async function generateFallbackImage(prompt: string): Promise<string> {
  const encodedPrompt = encodeURIComponent(prompt.trim());
  const seed = Math.floor(Math.random() * 1000000);
  const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&seed=${seed}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Fallback engine HTTP ${res.status}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  const contentType = res.headers.get("content-type") || "image/jpeg";
  return `data:${contentType};base64,${base64}`;
}

export const Route = createFileRoute("/api/tools/image")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { prompt } = (await request.json()) as { prompt?: string };
        if (!prompt || typeof prompt !== "string" || prompt.trim().length < 3) {
          return new Response(JSON.stringify({ error: "الوصف مطلوب (3 حروف على الأقل)." }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }
        if (prompt.length > 1000) {
          return new Response(
            JSON.stringify({ error: "الوصف طويل جدًا (الحد الأقصى 1000 حرف)." }),
            {
              status: 413,
              headers: { "Content-Type": "application/json" },
            },
          );
        }

        // Enforce admin enable/disable toggle server-side
        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { data: tool } = await supabaseAdmin
            .from("admin_ai_tools")
            .select("enabled")
            .eq("tool_key", "image")
            .maybeSingle();
          if (tool && tool.enabled === false) {
            return new Response(JSON.stringify({ error: "هذه الأداة معطّلة حاليًا." }), {
              status: 403,
              headers: { "Content-Type": "application/json" },
            });
          }
        } catch {
          // fail open on lookup errors
        }

        const key = process.env.GEMINI_API_KEY;

        // Try Primary Engine: Gemini 2.5 Flash Image
        if (key) {
          try {
            const model = "gemini-2.5-flash-image";
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;

            const upstream = await fetch(url, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ role: "user", parts: [{ text: prompt.trim() }] }],
                generationConfig: { responseModalities: ["IMAGE"] },
              }),
            });

            if (upstream.ok) {
              const data = (await upstream.json()) as {
                candidates?: Array<{ content?: { parts?: GeminiPart[] } }>;
              };

              const parts = data.candidates?.[0]?.content?.parts ?? [];
              for (const p of parts) {
                const inline = p.inlineData ?? p.inline_data;
                if (inline?.data) {
                  const mime =
                    inline.mimeType ??
                    (p.inline_data as { mime_type?: string })?.mime_type ??
                    "image/png";
                  return new Response(
                    JSON.stringify({ dataUrl: `data:${mime};base64,${inline.data}`, provider: "gemini" }),
                    { headers: { "Content-Type": "application/json" } }
                  );
                }
              }
            } else {
              const text = await upstream.text().catch(() => "");
              console.warn("[Image Tool] Primary Gemini API error or spending cap reached:", text);
            }
          } catch (err: any) {
            console.warn("[Image Tool] Primary Gemini API exception:", err.message);
          }
        }

        // Seamless High-Quality Fallback Engine (Pollinations AI)
        try {
          console.log("[Image Tool] Switching seamlessly to fallback high-speed AI image engine...");
          const dataUrl = await generateFallbackImage(prompt);
          return new Response(
            JSON.stringify({ dataUrl, provider: "pollinations" }),
            { headers: { "Content-Type": "application/json" } }
          );
        } catch (fallbackErr: any) {
          console.error("[Image Tool] Fallback engine error:", fallbackErr.message);
          return new Response(
            JSON.stringify({ error: "تعذّر توليد الصورة حالياً. يرجى المحاولة مرة أخرى لاحقاً." }),
            { status: 502, headers: { "Content-Type": "application/json" } }
          );
        }
      },
    },
  },
});
